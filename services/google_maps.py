# backend/services/google_maps.py
import os
import httpx

GOOGLE_KEY = os.getenv("AIzaSyB5Y18MN3AIEDMzBxI_lSIIGVhxyigpCRU")
BASE = "https://maps.googleapis.com/maps/api/distancematrix/json"

# simple in-memory cache for repeated requests in the same server run
_cache = {}

async def get_travel_time(origin: str, destination: str, departure_epoch: int):
    """
    Calls Google Distance Matrix and returns a dict:
    { "duration_in_traffic": {"value": seconds, "text": "..."} }
    or falls back to "duration".
    Raises Exception if Google returns an error.
    """
    if GOOGLE_KEY is None:
        raise Exception("GOOGLE_MAPS_API_KEY not set in environment")

    key = f"{origin}|{destination}|{departure_epoch}"
    if key in _cache:
        return _cache[key]

    params = {
        "origins": origin,
        "destinations": destination,
        "departure_time": str(departure_epoch),
        "traffic_model": "best_guess",
        "key": GOOGLE_KEY
    }

    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(BASE, params=params)
        data = r.json()

    if data.get("status") != "OK":
        msg = data.get("error_message") or data.get("status")
        raise Exception(f"Google API error: {msg}")

    element = data["rows"][0]["elements"][0]
    if element.get("status") != "OK":
        raise Exception(f"Route element error: {element.get('status')}")

    result = {}
    if element.get("duration_in_traffic"):
        d = element["duration_in_traffic"]
        result["duration_in_traffic"] = {"value": d["value"], "text": d["text"]}
    else:
        d = element["duration"]
        result["duration"] = {"value": d["value"], "text": d["text"]}

    _cache[key] = result
    return result
