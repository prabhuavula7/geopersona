import React, { useState } from "react";
import ThemeToggle from "./ThemeToggle.jsx";

export default function EntryScreen({ onSelectDifficulty, onStartGame, theme, onToggleTheme }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  const handleDifficultySelect = (difficulty) => {
    console.log("Difficulty selected in EntryScreen:", difficulty);
    setSelectedDifficulty(difficulty);
    onSelectDifficulty(difficulty); // This will update the App component's difficulty state
  };

  const handleStartGame = () => {
    console.log("Start Game button clicked!");
    console.log("selectedDifficulty:", selectedDifficulty);
    console.log("onStartGame prop:", onStartGame);
    console.log("typeof onStartGame:", typeof onStartGame);
    if (selectedDifficulty && onStartGame) {
      console.log("Calling onStartGame...");
      onStartGame();
    } else {
      console.error("Cannot start game:", { selectedDifficulty, onStartGame });
    }
  };

  const getDifficultyDescription = (difficulty) => {
    switch (difficulty) {
      case "beginner":
        return "Major/capital cities with landmarks, airport codes, neighborhoods, and state/province names.";
      case "intermediate":
        return "Tier-2 cities with neighborhoods and airport codes (no landmarks or state/province names).";
      case "advanced":
        return "Tier-3 cities relying on culture, transit patterns, food styles, and climate only.";
      default:
        return "";
    }
  };

  return (
    <div className="w-screen h-screen app-bg text-primary flex items-center justify-center p-6">
      <div className="max-w-6xl w-full glass rounded-3xl p-10 neon card overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
            GeoPersona
          </h1>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
        
        <p className="text-secondary text-lg mb-8 leading-relaxed">
          Embark on a global adventure! Decode clues from fascinating personas and discover cities around the world. 🌍✨
        </p>

        {/* Game Instructions */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">How to Play</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white/5 dark:bg-black/20 rounded-lg p-4 border border-purple-200/20 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-300">
                <h3 className="font-semibold text-primary mb-2">🎯 Goal</h3>
                <p className="text-sm text-secondary">Read the persona's clues and pin the exact city on the map. You get 5 rounds—score as many points as you can.</p>
              </div>
              
              <div className="bg-white/5 dark:bg-black/20 rounded-lg p-4 border border-purple-200/20 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-300">
                <h3 className="font-semibold text-primary mb-2">⚡ Quick Start</h3>
                <ul className="text-sm text-secondary space-y-1">
                  <li>• Read the 2–4 sentence persona + 4 social clues</li>
                  <li>• Pick a spot on the map and place your pin</li>
                  <li>• Submit your guess and see your score</li>
                  <li>• Repeat for all 5 rounds</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/5 dark:bg-black/20 rounded-lg p-4 border border-purple-200/20 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-300">
                <h3 className="font-semibold text-primary mb-2">🏆 Scoring</h3>
                <p className="text-sm text-secondary">≤ 7 km = 5000 pts, then decreases smoothly with distance down to 0 at ~20,000 km. Faster guesses and closer pins help your total.</p>
              </div>
              
              <div className="bg-white/5 dark:bg-black/20 rounded-lg p-4 border border-purple-200/20 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-300">
                <h3 className="font-semibold text-primary mb-2">💡 Tips</h3>
                <p className="text-sm text-secondary">Note transit patterns, food prep styles, street textures, and climate hints. Zoom in and adjust your pin carefully!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-primary mb-4">Choose Your Challenge Level</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["beginner", "intermediate", "advanced"].map((difficulty) => (
              <button
                key={difficulty}
                className={`w-full h-14 text-base font-semibold transition-all duration-300 rounded-xl border-2 ${
                  selectedDifficulty === difficulty
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400 shadow-lg shadow-green-500/30 scale-105"
                    : "btn-primary neon hover:scale-105"
                }`}
                onClick={() => handleDifficultySelect(difficulty)}
              >
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Difficulty Description */}
          {selectedDifficulty && (
            <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200/30">
              <p className="text-sm text-secondary">
                <span className="font-semibold text-primary">{selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}:</span>{" "}
                {getDifficultyDescription(selectedDifficulty)}
              </p>
            </div>
          )}
        </div>

        {/* Start Game Button */}
        {selectedDifficulty && (
          <div className="text-center">
            <button
              className="btn-primary neon w-full max-w-md h-16 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              onClick={handleStartGame}
            >
              🚀 Start Game
            </button>
          </div>
        )}
        
        {/* Copyright Footer */}
        <div className="mt-8 text-center text-xs text-secondary/60">
          <div>© {new Date().getFullYear()} Prabhu Kiran Avula</div>
          <div className="text-xs mt-1">Built with ❤️ to learn geography</div>
        </div>
      </div>
    </div>
  );
}
