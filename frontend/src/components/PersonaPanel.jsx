import React from "react";
import ThemeToggle from "./ThemeToggle.jsx";

export default function PersonaPanel({
  theme,
  onToggleTheme,
  gameStarted,
  round,
  totalScore,
  loadingPersona,
  persona,
  onStart,
  onSubmit,
  canSubmit,
  onNext,
  onFinish,
  onReset,
  gameOver,
  score,
  feedback,
}) {
  const clues = persona?.clues || {};
  const socialSnippets = clues?.socialSnippets || {};

  return (
    <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col justify-between h-screen overflow-y-auto bg-secondary/50 backdrop-blur-sm">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-primary">
            🌍 GeoPersona
          </h2>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>

        {!gameStarted && (
          <div className="flex flex-col mt-8 space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 text-primary">
                Welcome to GeoPersona!
              </h1>
              <p className="text-lg text-secondary">
                Test your geography skills by guessing locations based on user personas
              </p>
            </div>
            <div className="flex justify-center mt-8">
              <button onClick={onStart} className="btn-primary neon text-lg px-8 py-4">
                Start Game
              </button>
            </div>
          </div>
        )}

        {gameStarted && (
          <>
            {/* Game Info */}
            <div className="mb-6 p-4 bg-primary/10 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-secondary">Round {round}/5</span>
                <span className="text-sm font-medium text-secondary">Score: {totalScore.toLocaleString()}</span>
              </div>
            </div>
            
            {loadingPersona || !persona ? (
              <div className="space-y-4">
                <div className="skeleton h-4 rounded w-2/3"></div>
                <div className="skeleton h-3 rounded w-full"></div>
                <div className="skeleton h-3 rounded w-5/6"></div>
                <div className="skeleton h-3 rounded w-4/5"></div>
              </div>
            ) : (
              <div className="glass rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="chip">persona</span>
                  <p className="font-semibold text-primary text-lg">
                    {clues.name || "-"}, {clues.age ?? "-"} — {clues.job || "-"}
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-tertiary/50 rounded-xl">
                    <p className="text-sm text-muted mb-2">🕐 Daily Routine</p>
                    <p className="text-primary leading-relaxed">{clues.routine || ""}</p>
                  </div>
                  
                  <div className="p-4 bg-tertiary/50 rounded-xl">
                    <p className="font-semibold mb-3 text-primary">💬 Social Life</p>
                    <div className="space-y-2">
                      {Object.entries(socialSnippets).map(([category, detail]) => (
                        <div key={category} className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                          <div>
                            <span className="capitalize font-medium text-secondary text-sm">{category}:</span>
                            <p className="text-primary text-sm">{detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {clues.funFact && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200/50 dark:border-purple-700/30">
                      <p className="text-sm italic text-primary">
                        🧠 <span className="font-medium">Fun Fact:</span> {clues.funFact}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {round > 0 && (
        <div className="mt-6 space-y-4">
          {!gameOver ? (
            score === null ? (
              <button 
                onClick={onSubmit} 
                disabled={!canSubmit} 
                className={`btn-primary neon w-full h-14 text-base font-semibold ${!canSubmit ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Submit Guess
              </button>
            ) : (
              <div className="glass rounded-2xl p-6 space-y-4">
                <div className="text-center">
                  <p className="text-lg font-medium text-primary mb-2">{feedback}</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    Round {round} Score: {score.toLocaleString()}
                  </p>
                  <p className="text-sm text-secondary mt-1">
                    Running Total: {totalScore.toLocaleString()} / 25,000
                  </p>
                </div>
                {round < 5 ? (
                  <button onClick={onNext} className="btn-primary neon w-full h-14 text-base font-semibold">
                    Next Round ({round}/5)
                  </button>
                ) : (
                  <button onClick={onFinish} className="btn-primary neon w-full h-14 text-base font-semibold">
                    Finish Game
                  </button>
                )}
              </div>
            )
          ) : (
            <div className="glass rounded-3xl p-8 text-center space-y-6">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎉</span>
                </div>
                <h2 className="text-3xl font-bold text-primary mb-2">Game Complete!</h2>
                <p className="text-lg text-secondary">You've finished all 5 rounds</p>
              </div>
              
              <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/30">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  Final Score: {totalScore.toLocaleString()} / 25,000
                </p>
                <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-1000" 
                    style={{ width: `${(totalScore / 25000) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-secondary">
                  {Math.round((totalScore / 25000) * 100)}% of maximum possible score
                </p>
              </div>
              
              <div className="space-y-3">
                <button onClick={onReset} className="btn-primary neon w-full h-14 text-lg font-semibold">
                  Play Again
                </button>
                <p className="text-xs text-muted">
                  Choose a different difficulty or challenge yourself to beat your score!
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Copyright Footer */}
      <div className="mt-auto pt-4 text-center text-xs text-secondary/60">
        <div>© {new Date().getFullYear()} Prabhu Kiran Avula</div>
        <div className="text-xs mt-1">Built with ❤️ to learn geography</div>
      </div>
    </div>
  );
}
