from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import requests
import os
from dotenv import load_dotenv
import pytz
from fastapi.middleware.cors import CORSMiddleware

# ----- Config / API key -----
load_dotenv()
GOOGLE_MAPS_API_KEY = (
    os.getenv("GOOGLE_MAPS_API_KEY")
    or "Your key here please :D"  
)

app = FastAPI(title="Traffic Departure Predictor", version="2.0.0")

# CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----- Models -----
class LatLng(BaseModel):
    lat: float
    lng: float

class RouteRequest(BaseModel):
    origin: Optional[str] = None
    destination: Optional[str] = None
    origin_coords: Optional[LatLng] = None
    destination_coords: Optional[LatLng] = None

class PredictRequest(RouteRequest):
    arrival_time: str                                  # "YYYY-MM-DDTHH:MM"
    time_zone: str = "Asia/Kolkata"
    max_search_hours: int = 3
    step_minutes: int = 10
    buffer_minutes: int = 5

# ----- Helpers -----
def fmt_place(address: Optional[str], coords: Optional[LatLng]) -> str:
    """Prefer lat,lng when available; else the address string."""
    if coords:
        return f"{coords.lat},{coords.lng}"
    return address or ""

def call_distance_matrix(orig: str, dest: str, departure: str) -> dict:
    """
    departure: "now" or epoch int (as string)
    """
    url = (
        "https://maps.googleapis.com/maps/api/distancematrix/json"
        f"?origins={orig}"
        f"&destinations={dest}"
        f"&departure_time={departure}"
        f"&traffic_model=best_guess"
        f"&key={GOOGLE_MAPS_API_KEY}"
    )
    return requests.get(url).json()

def call_directions(orig: str, dest: str, departure: Optional[str] = None) -> dict:
    url = (
        "https://maps.googleapis.com/maps/api/directions/json"
        f"?origin={orig}"
        f"&destination={dest}"
        f"&key={GOOGLE_MAPS_API_KEY}"
        f"&traffic_model=best_guess"
    )
    if departure:
        url += f"&departure_time={departure}"
    return requests.get(url).json()

def extract_steps(directions_json) -> list:
    try:
        legs = directions_json["routes"][0]["legs"]
        steps = []
        for leg in legs:
            for step in leg["steps"]:
                steps.append(step.get("html_instructions", ""))
        return steps
    except Exception:
        return []

# ----- Endpoints -----
@app.post("/get_route")
def get_route(data: RouteRequest):
    """
    Quick route info (now).
    Returns distance, duration, duration_in_traffic, summary, steps.
    """
    origin = fmt_place(data.origin, data.origin_coords)
    destination = fmt_place(data.destination, data.destination_coords)

    dm = call_distance_matrix(origin, destination, "now")
    dr = call_directions(origin, destination, "now")

    if dm.get("status") == "OK" and dr.get("status") == "OK":
        try:
            leg = dr["routes"][0]["legs"][0]
            element = dm["rows"][0]["elements"][0]

            distance_text = leg["distance"]["text"]
            duration_text = leg["duration"]["text"]
            duration_traffic_text = (
                element.get("duration_in_traffic", {}).get("text") or duration_text
            )

            return {
                "origin": data.origin,
                "destination": data.destination,
                "distance": distance_text,
                "duration": duration_text,
                "duration_in_traffic": duration_traffic_text,
                "suggested_departure": "Now (real-time estimate)",
                "summary": dr["routes"][0].get("summary", ""),
                "steps": extract_steps(dr),
            }
        except Exception as e:
            return {"error": "Parsing error", "details": str(e), "raw": {"dm": dm, "dr": dr}}
    else:
        return {
            "error": "Failed to fetch route",
            "details": {"directions_status": dr.get("status"), "matrix_status": dm.get("status")},
        }

@app.post("/predict")
def predict_departure(req: PredictRequest):
    """
    Computes a latest departure that still arrives by arrival_time (in req.time_zone).
    Also returns distance/duration like /get_route.
    """
    origin = fmt_place(req.origin, req.origin_coords)
    destination = fmt_place(req.destination, req.destination_coords)

    tz = pytz.timezone(req.time_zone)
    arrival_dt_local = tz.localize(datetime.fromisoformat(req.arrival_time))
    latest_departure_local = arrival_dt_local - timedelta(minutes=req.buffer_minutes)
    earliest_departure_local = latest_departure_local - timedelta(hours=req.max_search_hours)

    best_departure_local = None
    best_element = None

    current = latest_departure_local
    while current >= earliest_departure_local:
        dep_epoch = int(current.timestamp())
        dm = call_distance_matrix(origin, destination, str(dep_epoch))

        try:
            element = dm["rows"][0]["elements"][0]
            if element.get("status") != "OK":
                current -= timedelta(minutes=req.step_minutes)
                continue

            travel_seconds = element.get("duration_in_traffic", element.get("duration", {})).get("value")
            if travel_seconds is None:
                current -= timedelta(minutes=req.step_minutes)
                continue

            arrival_estimate = current + timedelta(seconds=int(travel_seconds))
            if arrival_estimate <= arrival_dt_local:
                best_departure_local = current
                best_element = element
        except Exception:
            pass

        current -= timedelta(minutes=req.step_minutes)

    if not best_departure_local:
        return {"error": "No suitable departure time found within your window."}

    dep_epoch = int(best_departure_local.timestamp())
    dr = call_directions(origin, destination, str(dep_epoch))

    if dr.get("status") != "OK":
        return {
            "error": "Could not fetch directions for the recommended time.",
            "details": {"directions_status": dr.get("status")},
        }

    try:
        leg = dr["routes"][0]["legs"][0]
        distance_text = best_element.get("distance", {}).get("text") or leg["distance"]["text"]
        duration_text = leg["duration"]["text"]
        duration_traffic_text = best_element.get("duration_in_traffic", {}).get("text") or duration_text

        return {
            "origin": req.origin,
            "destination": req.destination,
            "distance": distance_text,
            "duration": duration_text,
            "duration_in_traffic": duration_traffic_text,
            "recommended_departure_iso": best_departure_local.isoformat(),
            "recommended_departure_epoch": dep_epoch,
            "summary": dr["routes"][0].get("summary", ""),
            "steps": extract_steps(dr),
        }
    except Exception as e:
        return {"error": "Parsing error", "details": str(e), "raw": {"dr": dr}}

@app.get("/")
def root():
    return {"status": "Backend is running 🚀"}

# 🚀 Add this to make Railway detect and run the app!
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
