import React, { useEffect, useLayoutEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Default marker icon setup
L.Marker.prototype.options.icon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function GameMap({
  theme,
  active, // boolean: gameStarted && round > 0
  canPlaceGuess,
  onMapClick, // (lat, lng) => void
  guessCoords,
  answer, // { correctLat, correctLon, correctCity }
  showResult, // boolean: score !== null
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const correctMarkerRef = useRef(null);
  const lineRef = useRef(null);

  const handleMapClick = (e) => {
    if (!canPlaceGuess) return;
    const { lat, lng } = e.latlng;
    onMapClick(lat, lng);
  };

  // Create / destroy map
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (!mapRef.current && active) {
      // Ensure full-size container
      el.style.width = "100%";
      el.style.height = "100vh";

      mapRef.current = L.map(el, {
        scrollWheelZoom: true,
        preferCanvas: true,
        zoomSnap: 1,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 120,
        wheelDebounceTime: 50,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
      }).setView([20, 0], 2);

      // Always use light tiles for better readability in both themes
      const tiles = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution: "© OpenStreetMap, © CARTO",
          maxZoom: 19,
        }
      );
      tiles.addTo(mapRef.current);

      mapRef.current.on("click", handleMapClick);

      // Invalidate size after mount
      setTimeout(() => mapRef.current && mapRef.current.invalidateSize(), 0);
      setTimeout(() => mapRef.current && mapRef.current.invalidateSize(), 100);
      setTimeout(() => mapRef.current && mapRef.current.invalidateSize(), 300);
    }

    // Cleanup
    return () => {
      if (mapRef.current && !active) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [active, theme]);

  // Cursor
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.style.cursor = canPlaceGuess ? "crosshair" : "grab";
  }, [canPlaceGuess]);

  // Render guess marker when guessCoords change
  useEffect(() => {
    if (!mapRef.current) return;
    if (!guessCoords) {
      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      return;
    }

    if (markerRef.current) {
      mapRef.current.removeLayer(markerRef.current);
    }
    
    // Create custom guess marker with new design
    const guessIcon = L.divIcon({
      className: "guess-marker",
      html: `
        <div style="
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">
          ?
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    markerRef.current = L.marker([guessCoords.lat, guessCoords.lng], { icon: guessIcon })
      .addTo(mapRef.current)
      .bindPopup(`
        <div style="
          background: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-weight: 500;
          color: #1e293b;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        ">
          Your Guess
        </div>
      `)
      .openPopup();
  }, [guessCoords]);

  // Render result (correct marker + polyline) when showResult toggles
  useEffect(() => {
    if (!mapRef.current) return;
    if (!showResult || !answer) {
      if (correctMarkerRef.current) {
        mapRef.current.removeLayer(correctMarkerRef.current);
        correctMarkerRef.current = null;
      }
      if (lineRef.current) {
        mapRef.current.removeLayer(lineRef.current);
        lineRef.current = null;
      }
      return;
    }

    const { correctLat, correctLon, correctCity } = answer;

    if (correctMarkerRef.current) mapRef.current.removeLayer(correctMarkerRef.current);
    
    // Create custom correct location marker with new design
    const correctIcon = L.divIcon({
      className: "correct-location-marker",
      html: `
        <div style="
          background: linear-gradient(135deg, #10b981, #059669);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">
          ✓
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    correctMarkerRef.current = L.marker([correctLat, correctLon], { icon: correctIcon })
      .addTo(mapRef.current)
      .bindPopup(`
        <div style="
          background: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-weight: 500;
          color: #1e293b;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        ">
          Actual: ${correctCity}
        </div>
      `);

    if (lineRef.current) mapRef.current.removeLayer(lineRef.current);
    if (guessCoords) {
      // Create polyline with new design
      lineRef.current = L.polyline(
        [
          [guessCoords.lat, guessCoords.lng],
          [correctLat, correctLon],
        ],
        { 
          color: "#8b5cf6", 
          weight: 4, 
          opacity: 0.8, 
          dashArray: "8,4",
          lineCap: "round",
          lineJoin: "round"
        }
      ).addTo(mapRef.current);

      const group = L.featureGroup([markerRef.current, correctMarkerRef.current, lineRef.current]);
      mapRef.current.fitBounds(group.getBounds(), { padding: [20, 20], maxZoom: 10, animate: true, duration: 1.5 });
    }
  }, [showResult, answer]);

  // Clear all overlays between rounds when a new round starts (active stays true but guess resets)
  useEffect(() => {
    if (!mapRef.current) return;
    // when guessCoords is cleared for a new round, also clear results from previous round
    if (!guessCoords) {
      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      if (correctMarkerRef.current) {
        mapRef.current.removeLayer(correctMarkerRef.current);
        correctMarkerRef.current = null;
      }
      if (lineRef.current) {
        mapRef.current.removeLayer(lineRef.current);
        lineRef.current = null;
      }
    }
  }, [guessCoords]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full glass" 
      style={{ 
        minHeight: "100vh", 
        minWidth: "100%",
        borderRadius: "0",
        border: "none"
      }} 
    />
  );
}
