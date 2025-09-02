import React, { useEffect, useRef } from "react";

function MapPicker({ location, label, onLocationSelect }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!window.google) return;

    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: location || { lat: 12.9716, lng: 77.5946 },
      zoom: 12,
      disableDefaultUI: true,
      zoomControl: true,
    });

    if (location) {
      markerRef.current = new window.google.maps.Marker({
        position: location,
        map: mapInstance.current,
        animation: window.google.maps.Animation.DROP,
        label,
      });
    }

    mapInstance.current.addListener("click", (e) => {
      const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() };

      // Reverse geocode to address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: coords }, (results, status) => {
        if (status === "OK" && results[0]) {
          const address = results[0].formatted_address;

          if (markerRef.current) markerRef.current.setMap(null);
          markerRef.current = new window.google.maps.Marker({
            position: coords,
            map: mapInstance.current,
            animation: window.google.maps.Animation.DROP,
            label,
          });

          onLocationSelect(address, coords);
        }
      });
    });
  }, [label, onLocationSelect]);

  // Re-center and update marker if location changes from outside
  useEffect(() => {
    if (location && mapInstance.current) {
      mapInstance.current.setCenter(location);
      if (markerRef.current) markerRef.current.setMap(null);
      markerRef.current = new window.google.maps.Marker({
        position: location,
        map: mapInstance.current,
        animation: window.google.maps.Animation.DROP,
        label,
      });
    }
  }, [location, label]);

  return (
    <div
      ref={mapRef}
      className="map-box"
      style={{ width: "100%", height: 250, borderRadius: 15, overflow: "hidden", marginTop: 10, marginBottom: 15 }}
    />
  );
}

export default MapPicker;
