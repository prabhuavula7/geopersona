import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import "./index.css";

L.Marker.prototype.options.icon = L.icon({ iconUrl, shadowUrl: iconShadow });

export default function App() {
  const [persona, setPersona] = useState(null);
  const [loadingPersona, setLoadingPersona] = useState(false);
  const [roundLoading, setRoundLoading] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [guessCoords, setGuessCoords] = useState(null);
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [theme, setTheme] = useState("light");
  const [round, setRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const correctMarkerRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const fetchPersona = async () => {
    setLoadingPersona(true);
    const res = await fetch("http://localhost:8000/generate_persona");
    const data = await res.json();
    setPersona(data);
    setMapKey((prev) => prev + 1);
    setLoadingPersona(false);
  };

  const startGame = async () => {
    setRound(1);
    setTotalScore(0);
    setGameOver(false);
    setGameStarted(true);
    setPersona(null);
    setGuessCoords(null);
    setScore(null);
    setFeedback("");
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    await fetchPersona();
  };

  const nextRound = async () => {
    if (round < 5) {
      setRoundLoading(true);
      setRound((prev) => prev + 1);
      setGuessCoords(null);
      setScore(null);
      setFeedback("");
      setPersona(null);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      await fetchPersona();
      setRoundLoading(false);
    }
  };

  useLayoutEffect(() => {
    const mapEl = document.getElementById("map");
    if (!mapRef.current && mapEl && persona && gameStarted) {
      mapRef.current = L.map("map").setView([20, 0], 2);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap contributors',
      }).addTo(mapRef.current);
      mapRef.current.on("click", handleMapClick);
      setTimeout(() => mapRef.current.invalidateSize(), 100);
    }
  }, [mapKey, persona]);

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setGuessCoords({ lat, lng });

    if (markerRef.current) {
      mapRef.current.removeLayer(markerRef.current);
    }

    markerRef.current = L.marker([lat, lng])
      .addTo(mapRef.current)
      .bindPopup("Your Guess")
      .openPopup();
  };

  const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const evaluateGuess = () => {
    if (!guessCoords || !persona?.answer || gameOver) return;

    const { correctLat, correctLon, correctCity, correctLocation } = persona.answer;
    const d = haversine(guessCoords.lat, guessCoords.lng, correctLat, correctLon);

    let points = d < 15 ? 100 : d < 100 ? 75 : 50;
    setScore(points);
    setTotalScore((prev) => prev + points);
    setFeedback(`You were ${d.toFixed(2)} km away from ${correctCity}, ${correctLocation}. Score: ${points}`);

    if (correctMarkerRef.current) mapRef.current.removeLayer(correctMarkerRef.current);
    correctMarkerRef.current = L.marker([correctLat, correctLon], {
      icon: L.divIcon({
        className: "correct-location-icon",
        html: '<div style="background:green;width:20px;height:20px;border-radius:50%;border:2px solid white;"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      }),
    }).addTo(mapRef.current).bindPopup(`Actual: ${correctCity}`).openPopup();

    if (lineRef.current) mapRef.current.removeLayer(lineRef.current);
    lineRef.current = L.polyline(
      [
        [guessCoords.lat, guessCoords.lng],
        [correctLat, correctLon],
      ],
      {
        color: "orange",
        weight: 2,
        opacity: 0.8,
        dashArray: "4",
      }
    ).addTo(mapRef.current);

    if (round >= 5) setGameOver(true);
  };

  if (!gameStarted || loadingPersona || roundLoading || !persona) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col justify-center items-center p-6">
        <h1 className="text-3xl font-bold mb-6">🌍 GeoPersona</h1>
        {!gameStarted && (
          <button
            onClick={startGame}
            disabled={loadingPersona}
            className="bg-purple-600 dark:bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
          >
            Start Game
          </button>
        )}
        {(loadingPersona || roundLoading) && (
          <p className="text-sm mt-4 text-gray-500 dark:text-gray-400">
            Loading round {round} of 5...
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-md max-h-screen overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">🌍 GeoPersona</h2>
          <button onClick={toggleTheme} className="text-2xl hover:scale-110 transition">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>

        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Round {round} of 5 | Total Score: {totalScore}
        </div>

        {persona && (
          <>
            <p className="mb-2 font-semibold">
              {persona.clues.name}, {persona.clues.age} — {persona.clues.job}
            </p>
            <p className="mb-1">🕐 Routine: {persona.clues.routine}</p>
            <p className="mb-1">
              💬 Social:{" "}
              {Object.entries(persona.clues.socialSnippets)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ")}
            </p>
            <p className="text-sm italic text-gray-600 dark:text-gray-400 mb-2">
              🧠 Fun fact: {persona.clues.funFact}
            </p>
            <div
              id="map"
              key={mapKey}
              className="w-full h-[60vh] rounded mb-4"
            />
          </>
        )}

        {!gameOver ? (
          score === null ? (
            <button
              onClick={evaluateGuess}
              disabled={!guessCoords}
              className={`${
                guessCoords
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              } dark:bg-blue-500 text-white px-4 py-2 rounded`}
            >
              Submit Guess
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-green-700 dark:text-green-400 font-semibold">{feedback}</p>
              <p className="text-sm">Round {round} Score: {score}</p>
              {round < 5 ? (
                <button
                  onClick={nextRound}
                  className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Next Round ({round}/5)
                </button>
              ) : (
                <button
                  onClick={() => setGameOver(true)}
                  className="bg-orange-600 dark:bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-700"
                >
                  Finish Game
                </button>
              )}
            </div>
          )
        ) : (
          <div className="text-center mt-4">
            <h2 className="text-xl font-bold">🎉 Game Over!</h2>
            <p className="text-lg">Your total score: {totalScore} / 500</p>
            <button
              onClick={() => {
                setGameStarted(false);
                setGameOver(false);
                setRound(0);
                setTotalScore(0);
                setPersona(null);
              }}
              className="mt-4 bg-purple-600 dark:bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
