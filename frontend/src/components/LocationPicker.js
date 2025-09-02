// src/components/LocationPicker.js
import React, { useEffect, useRef } from "react";

function LocationPicker({ label, value, onChange }) {
  const inputRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!window.google) return;

    // Initialize map
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 19.076, lng: 72.8777 }, // Mumbai default
      zoom: 12,
    });

    // Marker
    markerRef.current = new window.google.maps.Marker({
      map: mapInstance.current,
    });

    // Click → pick location
    mapInstance.current.addListener("click", (e) => {
      const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      placeMarkerAndGeocode(coords);
    });

    // Autocomplete setup
    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      { fields: ["formatted_address", "geometry"] }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;
      const coords = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      placeMarker(coords, place.formatted_address);
    });
  }, []);

  // Place marker & reverse geocode
  const placeMarkerAndGeocode = (coords) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: coords }, (results, status) => {
      if (status === "OK" && results[0]) {
        placeMarker(coords, results[0].formatted_address);
      }
    });
  };

  // Set marker + update parent
  const placeMarker = (coords, address) => {
    markerRef.current.setPosition(coords);
    mapInstance.current.setCenter(coords);
    onChange(address, coords);
  };

  // Update marker if value changes (sync from parent)
  useEffect(() => {
    if (!value || !mapInstance.current) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: value }, (results, status) => {
      if (status === "OK" && results[0]) {
        const loc = results[0].geometry.location;
        placeMarker(
          { lat: loc.lat(), lng: loc.lng() },
          results[0].formatted_address
        );
      }
    });
  }, [value]);

  return (
    <div style={{ marginBottom: "20px" }}>
      <label>{label}</label>
      <input
        ref={inputRef}
        type="text"
        defaultValue={value}
        placeholder={`Enter ${label}`}
        style={{
          width: "100%",
          padding: "12px 15px",
          marginBottom: "10px",
          borderRadius: "12px",
          border: "1px solid #444",
          background: "#2a2c3a",
          color: "#fff",
        }}
      />
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "220px",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
}

export default LocationPicker;
