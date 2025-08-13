import React from "react";

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={onToggle}
      className="relative inline-flex items-center w-16 h-9 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent"
      title="Toggle theme"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #a78bfa, #8b5cf6)"
          : "linear-gradient(135deg, #8b5cf6, #7c3aed)",
        boxShadow: isDark
          ? "0 4px 15px rgba(168, 133, 250, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
          : "0 4px 15px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
      }}
    >
      <span
        className={
          "inline-block w-7 h-7 bg-white rounded-full shadow-lg transform transition-all duration-300 ease-out " +
          (isDark ? "translate-x-7" : "translate-x-1")
        }
        style={{
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
        }}
      />
    </button>
  );
}
