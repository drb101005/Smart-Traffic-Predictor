import React, { useState } from "react";
import AddressInput from "./components/AddressInput";
import MapPicker from "./components/MapPicker";
import "./App.css";

function App() {
  const [origin, setOrigin] = useState({ address: "", location: null });
  const [destination, setDestination] = useState({ address: "", location: null });
  const [arrivalTime, setArrivalTime] = useState("");
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const fetchRoute = async () => {
    setErrMsg("");
    setLoading(true);
    setRouteData(null);

    try {
      const usingArrival = Boolean(arrivalTime);
      const endpoint = usingArrival
        ? "http://localhost:8000/predict"
        : "http://localhost:8000/get_route";

      const body = usingArrival
        ? {
            origin: origin.address,
            destination: destination.address,
            origin_coords: origin.location,
            destination_coords: destination.location,
            arrival_time: arrivalTime,
          }
        : {
            origin: origin.address,
            destination: destination.address,
            origin_coords: origin.location,
            destination_coords: destination.location,
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.error) setErrMsg(data.error);
      setRouteData(data);
    } catch (e) {
      setErrMsg("Network error. Is the backend running on :8000?");
    } finally {
      setLoading(false);
    }
  };

  const swapLocations = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="container">
      <div className="card">
        <h1>Traffic Predictor 🚦</h1>

        {/* Origin */}
        <div className="form-group">
          <label>Origin</label>
          <AddressInput
            value={origin.address}
            onChange={(address) => setOrigin({ ...origin, address })}
            onPlaceSelect={(address, location) => setOrigin({ address, location })}
          />
          <MapPicker
            location={origin.location}
            label="A"
            onLocationSelect={(address, loc) => setOrigin({ address, location: loc })}
          />
        </div>

        {/* Destination */}
        <div className="form-group">
          <label>Destination</label>
          <AddressInput
            value={destination.address}
            onChange={(address) => setDestination({ ...destination, address })}
            onPlaceSelect={(address, location) => setDestination({ address, location })}
          />
        </div>
        <MapPicker
          location={destination.location}
          label="B"
          onLocationSelect={(address, loc) => setDestination({ address, location: loc })}
        />

        {/* Controls */}
        <div className="two-col">
          <button className="swap" onClick={swapLocations}>🔄 Swap</button>
          <div className="form-group compact">
            <label>Desired Arrival Time</label>
            <input
              type="datetime-local"
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
            />
          </div>
        </div>

        <button onClick={fetchRoute} disabled={loading}>
          {loading ? "Calculating..." : "Get Route"}
        </button>

        {/* Output */}
        {(routeData || errMsg) && (
          <div className="output">
            <h3>Route Info</h3>

            {errMsg ? (
              <p style={{ color: "#ff6961" }}>{errMsg}</p>
            ) : (
              <>
                <p><b>From:</b> {origin.address}</p>
                <p><b>To:</b> {destination.address}</p>
                <p><b>Distance:</b> {routeData?.distance || "—"}</p>
                <p><b>Duration:</b> {routeData?.duration_in_traffic || routeData?.duration || "—"}</p>

                {arrivalTime && routeData?.recommended_departure_iso ? (
                  <p>
                    <b>Suggested Departure:</b>{" "}
                    Leave by {formatTime(routeData.recommended_departure_iso)} to arrive by{" "}
                    {formatTime(arrivalTime)}
                  </p>
                ) : (
                  routeData?.suggested_departure && (
                    <p><b>Suggested Departure:</b> {routeData.suggested_departure}</p>
                  )
                )}

                {routeData?.summary && (
                  <p><b>Route Summary:</b> {routeData.summary}</p>
                )}

                {Array.isArray(routeData?.steps) && routeData.steps.length > 0 && (
                  <>
                    <h4>Steps:</h4>
                    <ul>
                      {routeData.steps.map((s, i) => (
                        <li key={i} dangerouslySetInnerHTML={{ __html: s }} />
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
