import React, { useEffect, useRef } from "react";

function AddressInput({ value, onChange, placeholder, onPlaceSelect }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!window.google || !window.google.maps?.places) return;

    // Using classic Autocomplete. (Google warns but still supported.)
    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode"],
    });

    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (!place || !place.geometry) return;

      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      if (typeof onPlaceSelect === "function") {
        onPlaceSelect(place.formatted_address || value, location);
      }
    });
  }, [onPlaceSelect, value]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Enter a location"}
      style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid #444", background: "#2a2c3a", color: "#fff" }}
    />
  );
}

export default AddressInput;
