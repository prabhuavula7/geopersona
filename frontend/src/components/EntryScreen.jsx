import React from "react";
import ThemeToggle from "./ThemeToggle.jsx";

export default function EntryScreen({ onSelectDifficulty, theme, onToggleTheme }) {
  return (
    <div className="w-screen h-screen app-bg text-primary flex items-center justify-center p-6">
      <div className="max-w-xl w-full glass rounded-3xl p-10 neon card">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
            GeoPersona
          </h1>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
        <p className="text-secondary text-lg mb-8 leading-relaxed">
          Find the city from a stranger's day. Maps, vibes, and a little intuition.
        </p>
        <div className="space-y-3 text-sm text-muted mb-8">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            <p>Click anywhere on the world map to guess their city.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            <p>Scores: closer guesses earn more points. 5 rounds per game.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
            <p>Choose your challenge level below.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            className="btn-primary neon w-full h-14 text-base font-semibold" 
            onClick={() => onSelectDifficulty("beginner")}
          >
            Beginner
          </button>
          <button 
            className="btn-primary neon w-full h-14 text-base font-semibold" 
            onClick={() => onSelectDifficulty("intermediate")}
          >
            Intermediate
          </button>
          <button 
            className="btn-primary neon w-full h-14 text-base font-semibold" 
            onClick={() => onSelectDifficulty("advanced")}
          >
            Advanced
          </button>
        </div>
        
        {/* Copyright Footer */}
        <div className="mt-8 text-center text-xs text-secondary/60">
          <div>© {new Date().getFullYear()} Prabhu Kiran Avula</div>
          <div className="text-xs mt-1">Built with ❤️ to learn geography</div>
        </div>
      </div>
    </div>
  );
}
