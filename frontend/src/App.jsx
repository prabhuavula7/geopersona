import React, { useEffect, useState } from "react";
import EntryScreen from "./components/EntryScreen.jsx";
import PersonaPanel from "./components/PersonaPanel.jsx";
import GameMap from "./components/GameMap.jsx";
import GameRecap from "./components/GameRecap.jsx";
import "./index.css";
import { haversine, computeScore } from "./utils/geo.js";

export default function App() {
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  
  // Game progress
  const [round, setRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);
  
  // Current round state
  const [persona, setPersona] = useState(null);
  const [guessCoords, setGuessCoords] = useState(null);
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState("");
  
  // Game configuration
  const [difficulty, setDifficulty] = useState(null);
  const [gameCities, setGameCities] = useState([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  
  // UI state
  const [theme, setTheme] = useState("light");
  
  // Client-side fallback persona
  const clientFallbackPersona = {
    clues: {
      name: "Asha",
      age: 29,
      job: "Teacher",
      routine: "I ride a crowded train past old buildings and a cricket ground, then grab spicy snacks before evening classes.",
      socialSnippets: {
        slang: "yaar, timepass",
        food: "A plate of vada pav for ₹50 and a cutting chai",
        habits: "Late-night beach strolls and bargaining at markets",
        media: "Bollywood songs on the radio",
      },
      funFact: "Our city once hosted a massive kite festival where the sky turned into a patchwork of color.",
    },
    answer: {
      correctCity: "Mumbai",
      correctLocation: "Maharashtra, India",
      correctLat: 19.0760,
      correctLon: 72.8777,
      continent: "Asia",
    },
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Fetch game cities with continental diversity
  const fetchGameCities = async () => {
    try {
      setLoadingMessage("🌍 Selecting diverse cities for your game...");
      
      // Use environment variable or fallback to localhost for development
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const seed = `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
      const url = `${backendUrl}/api/game/cities/${difficulty}?count=5&seed=${seed}`;
      
      console.log("Fetching game cities");
      
      const res = await fetch(url);
      console.log("Response status:", res.status);
      console.log("Response ok:", res.ok);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response body:", errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      console.log("Game cities API data received");
      
      if (data && data.status === "success" && data.cities) {
        console.log("Setting game cities:", data.cities.length);
        setGameCities(data.cities);
        return data.cities;
      } else {
        console.error("Invalid response structure:", data);
        throw new Error("Invalid game cities response");
      }
    } catch (error) {
      console.error("Failed to fetch game cities:", error);
      return null;
    }
  };

  // Generate persona for a specific city
  const generatePersonaForCity = async (city) => {
    try {
      setLoadingMessage("🧠 Crafting persona for your next challenge...");
      console.log("Generating persona for next city");
      
      const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const seed = `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
      const params = new URLSearchParams();
      if (difficulty) params.set('difficulty', difficulty);
      params.set('seed', seed);
      params.set('theme', theme);
      // Pass city information to backend so it generates persona for the right city
      params.set('city', city.name);
      params.set('country', city.country);
      params.set('continent', city.continent);
      params.set('lat', city.lat.toString());
      params.set('lon', city.lon.toString());
      const url = `${backendUrl}/api/generate_persona?${params.toString()}`;
      
      console.log("Calling persona API");
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Persona API data received");
      
      if (data && data.clues && data.answer) {
        // Verify the backend returned the correct city
        if (data.answer.correctCity === city.name) {
          console.log("✅ Backend generated correct persona");
          setPersona(data);
          return true;
        } else {
          console.warn("❌ Backend returned wrong city, using fallback");
          // Use fallback but update it with the real city data
          const fallbackWithCity = {
            ...clientFallbackPersona,
            answer: {
              ...clientFallbackPersona.answer,
              correctCity: city.name,
              correctLocation: `${city.name}, ${city.country}`,
              correctLat: city.lat,
              correctLon: city.lon,
              continent: city.continent
            }
          };
          setPersona(fallbackWithCity);
          return false;
        }
      } else {
        console.warn("Persona API returned invalid data, using fallback");
        // Use fallback but update it with the real city data
        const fallbackWithCity = {
          ...clientFallbackPersona,
          answer: {
            ...clientFallbackPersona.answer,
            correctCity: city.name,
            correctLocation: `${city.name}, ${city.country}`,
            correctLat: city.lat,
            correctLon: city.lon,
            continent: city.continent
          }
        };
        setPersona(fallbackWithCity);
        return false;
      }
    } catch (error) {
      console.error("Failed to generate persona for city:", error);
      // Use fallback but update it with the real city data
      const fallbackWithCity = {
        ...clientFallbackPersona,
        answer: {
          ...clientFallbackPersona.answer,
          correctCity: city.name,
          correctLocation: `${city.name}, ${city.country}`,
          correctLat: city.lat,
          correctLon: city.lon,
          continent: city.continent
        }
      };
      setPersona(fallbackWithCity);
      return false;
    }
  };

  // Start a new game
  const startGame = async () => {
    try {
      // Loading is already on from handleSelectDifficulty, just update message
      setLoadingMessage("🌍 Selecting diverse cities for your game...");
      
      // Reset all game state
      setRound(0);
      setTotalScore(0);
      setGameOver(false);
      setPersona(null);
      setGuessCoords(null);
      setScore(null);
      setFeedback("");
      setGameHistory([]);
      setGameCities([]);
      
      console.log("Starting game");
      
      // Fetch game cities
      const cities = await fetchGameCities();
      console.log("Cities fetched successfully");
      
      if (!cities || cities.length === 0) {
        throw new Error("Failed to fetch game cities");
      }
      
      setGameCities(cities);
      
      // Start first round
      setRound(1);
      setLoadingMessage("🎯 Preparing your first challenge...");
      
      // Generate persona for first city
      const firstCity = cities[0];
      console.log("First city selected");
      
      if (firstCity) {
        const success = await generatePersonaForCity(firstCity);
        
        if (success) {
          console.log("Game started successfully!");
        } else {
          console.log("Game started with fallback persona");
        }
      } else {
        throw new Error("No cities available for the game");
      }
      
      // Set game as started to transition from entry screen
      setGameStarted(true);
      
      // Keep loading for a moment to show the transition, then clear it
      setLoadingMessage("🎉 Game ready! Loading your first challenge...");
      setTimeout(() => {
        setIsLoading(false);
        setLoadingMessage("");
      }, 1000);
      
    } catch (error) {
      console.error("Failed to start game:", error);
      // Use fallback persona
      setPersona(clientFallbackPersona);
      setRound(1);
      // Even on error, set game as started so user can see the persona
      setGameStarted(true);
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // Handle difficulty selection
  const handleSelectDifficulty = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    
    // Show loading screen immediately and keep it on
    setIsLoading(true);
    setLoadingMessage("🚀 Starting your geography adventure...");
    
    // Clear any existing game state
    setRound(0);
    setTotalScore(0);
    setGameOver(false);
    setPersona(null);
    setGuessCoords(null);
    setScore(null);
    setFeedback("");
    setGameHistory([]);
    setGameCities([]);
    
    // Don't set loading here - let startGame handle it
  };

  // Auto-start game when difficulty is set
  useEffect(() => {
    if (difficulty && !gameStarted) {
      console.log("Difficulty set, auto-starting game");
      // No delay needed since loading is already on
      startGame();
    }
  }, [difficulty, gameStarted]);

  // Move to next round
  const nextRound = async () => {
    if (round >= 5) return;
    
    try {
      setIsLoading(true);
      setLoadingMessage("🔄 Preparing next round...");
      
      // Reset round state
      setGuessCoords(null);
      setScore(null);
      setFeedback("");
      setPersona(null);
      
      const nextRoundNum = round + 1;
      const nextCity = gameCities[nextRoundNum - 1];
      
      if (nextCity) {
        console.log("🎯 Preparing next round");
        await generatePersonaForCity(nextCity);
        setRound(nextRoundNum);
      } else {
        console.error(`No city found for round ${nextRoundNum}`);
        setPersona(clientFallbackPersona);
        setRound(nextRoundNum);
      }
      
      // Keep loading for a moment to show the transition
      setLoadingMessage("🎯 Challenge ready!");
      setTimeout(() => {
        setIsLoading(false);
        setLoadingMessage("");
      }, 800);
      
    } catch (error) {
      console.error("Failed to move to next round:", error);
      setPersona(clientFallbackPersona);
      setRound(round + 1);
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // Reset game
  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setRound(0);
    setTotalScore(0);
    setPersona(null);
    setGuessCoords(null);
    setScore(null);
    setFeedback("");
    setDifficulty(null);
    setGameHistory([]);
    setShowRecap(false);
    setGameCities([]);
    setIsLoading(false);
    setLoadingMessage("");
  };

  // Handle play again
  const handlePlayAgain = () => {
    setShowRecap(false);
    resetGame();
  };

  // Handle map click
  const handleMapClick = (lat, lng) => {
    if (!gameStarted || gameOver || score !== null || round === 0) return;
    setGuessCoords({ lat, lng });
  };

  // Evaluate guess
  const evaluateGuess = () => {
    if (!guessCoords || !persona?.answer || gameOver) return;

    const { correctLat, correctLon, correctCity, correctLocation } = persona.answer;
    const d = haversine(guessCoords.lat, guessCoords.lng, correctLat, correctLon);

    const points = computeScore(d);
    setScore(points);
    setTotalScore((prev) => prev + points);
    
    // Create more informative feedback based on distance
    let distanceFeedback = "";
    let distanceDisplay = "";
    
    if (d <= 7) {
      distanceFeedback = "🎯 Perfect guess! You're within 7km - that's 5000 points!";
      distanceDisplay = d <= 1 ? `${d.toFixed(2)} km` : `${d.toFixed(1)} km`;
    } else if (d <= 25) {
      distanceFeedback = "🌟 Excellent guess! You're very close to the location.";
      distanceDisplay = `${d.toFixed(1)} km`;
    } else if (d <= 100) {
      distanceFeedback = "👍 Great guess! You're in the right region.";
      distanceDisplay = `${d.toFixed(1)} km`;
    } else if (d <= 500) {
      distanceFeedback = "👌 Good guess! You're in the right general area.";
      distanceDisplay = `${Math.round(d)} km`;
    } else if (d <= 1000) {
      distanceFeedback = "🤔 Not bad! You're in the right part of the world.";
      distanceDisplay = `${Math.round(d)} km`;
    } else {
      distanceFeedback = "🌍 Keep trying! Geography is tricky.";
      distanceDisplay = `${Math.round(d)} km`;
    }
    
    setFeedback(`${distanceFeedback} You were ${distanceDisplay} away from ${persona.answer.correctCity}. Score: ${points.toLocaleString()}`);

    // Store round data
    const roundData = {
      round,
      persona,
      guessCoords,
      score: points,
      distance: d,
      correctCity,
      correctLocation
    };
    setGameHistory(prev => [...prev, roundData]);

    // Check if game should end
    if (round >= 5) {
      setTimeout(() => {
        setGameOver(true);
        setTimeout(() => setShowRecap(true), 1000);
      }, 3000);
    }
  };

  // Show recap
  if (showRecap) {
    return (
      <GameRecap
        gameHistory={gameHistory}
        totalScore={totalScore}
        onPlayAgain={handlePlayAgain}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // Loading Screen - Always render above everything when isLoading is true
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center loading-screen bg-black/80 backdrop-blur-sm">
        <div className="text-center max-w-2xl mx-4 relative">
          {/* Animated Globe */}
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto relative loading-globe">
              <div className="absolute inset-0 border-4 border-purple-300/30 rounded-full loading-pulse-ring"></div>
              <div className="absolute inset-2 border-4 border-purple-400/50 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
              <div className="absolute inset-4 border-4 border-purple-500/70 rounded-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
              <div className="absolute inset-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* Loading Text */}
          <h2 className="text-3xl font-bold text-white mb-4">
            {loadingMessage || "Loading..."}
          </h2>
          
          {/* Loading Bar */}
          <div className="w-80 h-3 bg-purple-800/50 rounded-full mx-auto mb-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-400 to-purple-300 rounded-full loading-shimmer"></div>
          </div>
          
          {/* Loading Messages */}
          <div className="space-y-2 text-purple-200/80">
            <p className="text-lg">🌍 Analyzing global patterns...</p>
            <p className="text-lg">🧠 Crafting unique personas...</p>
            <p className="text-lg">🎯 Preparing your next challenge...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show entry screen
  if (!gameStarted) {
    return (
      <EntryScreen
        onSelectDifficulty={handleSelectDifficulty}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row app-bg text-primary transition-colors duration-300">
      {/* Persona Panel */}
      <PersonaPanel
        theme={theme}
        onToggleTheme={toggleTheme}
        gameStarted={gameStarted}
        round={round}
        totalScore={totalScore}
        loadingPersona={isLoading}
        persona={persona}
        onStart={startGame}
        onSubmit={evaluateGuess}
        canSubmit={!!guessCoords}
        onNext={nextRound}
        onFinish={() => setGameOver(true)}
        onReset={resetGame}
        gameOver={gameOver}
        score={score}
        feedback={feedback}
      />
      
      {/* Game Map */}
      <div className="w-full md:w-2/3 h-screen relative overflow-hidden">
        {gameStarted && !isLoading && persona ? (
          <GameMap
            theme={theme}
            active={gameStarted && round > 0}
            canPlaceGuess={gameStarted && !gameOver && score === null && round > 0}
            onMapClick={handleMapClick}
            guessCoords={guessCoords}
            answer={persona?.answer}
            showResult={score !== null}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="glass rounded-2xl p-8 text-center max-w-md mx-4">
              <h3 className="text-xl font-semibold text-primary mb-2">Ready to Start?</h3>
              <p className="text-secondary">Click 'Start Game' to begin your geography challenge</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Copyright Footer */}
      <div className="absolute bottom-2 right-4 text-xs text-secondary/60 z-20">
        <div className="text-center">
          <div>© {new Date().getFullYear()} Prabhu Kiran Avula</div>
          <div className="text-xs">Built with ❤️ to learn geography</div>
        </div>
      </div>
    </div>
  );
}