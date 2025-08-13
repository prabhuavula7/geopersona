import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import ThemeToggle from "./ThemeToggle.jsx";

// Default marker icon setup
L.Marker.prototype.options.icon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function GameRecap({ 
  gameHistory, 
  totalScore, 
  onPlayAgain, 
  theme,
  onToggleTheme
}) {
  const [selectedRound, setSelectedRound] = useState(1);
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const linesRef = useRef({});

  // Get the selected round data
  const currentRound = gameHistory.find(round => round.round === selectedRound);
  
  // Create / destroy map
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (!mapRef.current && currentRound) {
      // Ensure full-size container
      el.style.width = "100%";
      el.style.height = "100%";

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
      });

      // Always use light tiles for better readability
      const tiles = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution: "© OpenStreetMap, © CARTO",
          maxZoom: 19,
        }
      );
      tiles.addTo(mapRef.current);

      // Invalidate size after mount
      setTimeout(() => mapRef.current && mapRef.current.invalidateSize(), 0);
      setTimeout(() => mapRef.current && mapRef.current.invalidateSize(), 100);
      setTimeout(() => mapRef.current && mapRef.current.invalidateSize(), 300);
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [currentRound]); // Removed theme dependency

  // Initialize map with first round when component mounts
  useEffect(() => {
    if (gameHistory.length > 0 && !selectedRound) {
      setSelectedRound(1);
    }
  }, [gameHistory]);

  // Update map when selected round changes or when map is ready
  useEffect(() => {
    if (!mapRef.current || !currentRound) return;

    // Clear previous markers and lines
    Object.values(markersRef.current).forEach(marker => {
      if (marker) mapRef.current.removeLayer(marker);
    });
    Object.values(linesRef.current).forEach(line => {
      if (line) mapRef.current.removeLayer(line);
    });
    markersRef.current = {};
    linesRef.current = {};

    const { guessCoords, persona, score } = currentRound;
    if (!guessCoords || !persona?.answer) return;

    const { correctLat, correctLon, correctCity } = persona.answer;

    // Create guess marker
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

    const guessMarker = L.marker([guessCoords.lat, guessCoords.lng], { icon: guessIcon })
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
                  Your Guess<br>
        <small>Score: ${score?.toLocaleString() || 'N/A'}</small>
        </div>
      `);
    markersRef.current.guess = guessMarker;

    // Create correct location marker
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

    const correctMarker = L.marker([correctLat, correctLon], { icon: correctIcon })
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
    markersRef.current.correct = correctMarker;

    // Create polyline connecting guess to correct location
    const line = L.polyline(
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
    linesRef.current.line = line;

    // Fit map to show both markers with tight focus on the difference line
    const group = L.featureGroup([guessMarker, correctMarker, line]);
    const bounds = group.getBounds();
    
    // Add some padding but keep it tight around the line
    const paddedBounds = L.latLngBounds(
      [bounds.getSouthWest().lat - 0.01, bounds.getSouthWest().lng - 0.01],
      [bounds.getNorthEast().lat + 0.01, bounds.getNorthEast().lng + 0.01]
    );
    
    mapRef.current.fitBounds(paddedBounds, { 
      padding: [10, 10], 
      maxZoom: 15, 
      animate: true, 
      duration: 1.5 
    });
  }, [selectedRound, currentRound]);

  // Handle theme changes without recreating the map
  useEffect(() => {
    if (mapRef.current) {
      // Just invalidate the map size to ensure proper rendering with new theme
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 100);
    }
  }, [theme]);

  if (!currentRound) return null;

  const { guessCoords, persona, score } = currentRound;
  const { correctCity, correctLocation } = persona?.answer || {};

  return (
    <div className={`w-screen min-h-screen app-bg text-primary transition-colors duration-300`}>
      {/* Header with Theme Toggle */}
      <div className="sticky top-0 z-10 p-4 flex justify-between items-center glass backdrop-blur-sm">
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Game Recap
          </h1>
          <p className="text-lg text-secondary">
            Final Score: <span className="font-bold text-yellow-400">{totalScore.toLocaleString()}</span> points
          </p>
        </div>
        
        {/* Theme Toggle Slider */}
        <div className="flex-shrink-0">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>

      {/* Map Section - Takes more than half the screen */}
      <div className="p-4">
        <div className={`relative rounded-xl overflow-hidden shadow-xl glass transition-colors duration-300 ${
          theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'
        }`} style={{ height: '60vh' }}>
          <div 
            ref={containerRef} 
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Round Breakdown Table */}
      <div className="px-4 pb-4">
        <div className={`glass rounded-xl p-6 transition-colors duration-300 ${
          theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/50'
        }`}>
          <h3 className="text-xl font-semibold mb-4 text-center text-primary">Round Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-3 text-primary font-semibold">Round</th>
                  <th className="text-left p-3 text-primary font-semibold">Persona</th>
                  <th className="text-left p-3 text-primary font-semibold">Age</th>
                  <th className="text-left p-3 text-primary font-semibold">Job</th>
                  <th className="text-left p-3 text-primary font-semibold">Location</th>
                  <th className="text-center p-3 text-primary font-semibold">Score</th>
                </tr>
              </thead>
              <tbody>
                {gameHistory.map((round) => (
                  <tr 
                    key={round.round}
                    className={`border-b border-white/10 hover:bg-white/5 transition-colors duration-200 cursor-pointer ${
                      selectedRound === round.round ? 'bg-purple-600/20' : ''
                    }`}
                    onClick={() => setSelectedRound(round.round)}
                  >
                    <td className="p-3 font-semibold text-primary">Round {round.round}</td>
                    <td className="p-3 text-secondary">{round.persona?.clues?.name}</td>
                    <td className="p-3 text-secondary">{round.persona?.clues?.age}</td>
                    <td className="p-3 text-secondary">{round.persona?.clues?.job}</td>
                    <td className="p-3 text-secondary">
                      {round.persona?.answer?.correctCity}, {round.persona?.answer?.correctLocation?.split(', ').slice(-1)[0] || round.persona?.answer?.correctLocation}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        round.score >= 5000 ? 'bg-yellow-500 text-black' :
                        round.score >= 4000 ? 'bg-green-600' :
                        round.score >= 2000 ? 'bg-orange-500' : 'bg-red-500'
                      }`}>
                        {round.score?.toLocaleString() || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Play Again Button */}
      <div className="px-4 pb-6 text-center">
        <button
          onClick={onPlayAgain}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-2xl text-xl transition-all duration-200 transform hover:scale-105 shadow-2xl"
        >
          Play Again
        </button>
      </div>
      
      {/* Copyright Footer */}
      <div className="px-4 pb-4 text-center text-xs text-secondary/60">
        <div>© {new Date().getFullYear()} Prabhu Kiran Avula</div>
        <div className="text-xs mt-1">Built with ❤️ to learn geography</div>
      </div>
    </div>
  );
}
