import React, { useState, useEffect, useRef } from "react";
import { useAudio } from "../hooks/useAudio";
import "./Pomodoro.css";

interface PomodoroProps {
  isVisible: boolean;
  onClose: () => void;
}

export const Pomodoro: React.FC<PomodoroProps> = ({ isVisible, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes default
  const [originalTime, setOriginalTime] = useState(1500); // Track original time for reset
  const [customTime, setCustomTime] = useState("25"); // For input field
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { playTodoComplete, playButtonClick, playButtonHover } = useAudio();

  // Calculate fill percentage (0-100)
  const fillPercentage = ((originalTime - timeLeft) / originalTime) * 100;

  useEffect(() => {
    if (isActive && timeLeft > 0 && !isComplete) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;

          // Play tick sounds in last 10 seconds
          if (newTime <= 10 && newTime > 0) {
            playTickSound();
            triggerSecondGlow();
          }

          // Timer complete
          if (newTime === 0) {
            setIsComplete(true);
            setIsActive(false);
            playTodoComplete(); // Play completion sound
            triggerCompletionGlow();
          }

          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, isComplete]);

  const playTickSound = () => {
    // Generate subtle tick sound for countdown
    if (window.AudioContext || (window as any).webkitAudioContext) {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.1,
        audioContext.currentTime + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  };

  const triggerSecondGlow = () => {
    setShowGlow(true);
    setTimeout(() => setShowGlow(false), 200);
  };

  const triggerCompletionGlow = () => {
    setShowGlow(true);
    // Keep glow for longer on completion
    setTimeout(() => setShowGlow(false), 2000);
  };

  const handleStart = () => {
    setIsActive(true);
    playButtonClick();
  };

  const handlePause = () => {
    setIsActive(false);
    playButtonClick();
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(originalTime);
    setIsComplete(false);
    setShowGlow(false);
    playButtonClick();
  };

  const handlePresetTime = (minutes: number) => {
    if (!isActive) {
      const seconds = minutes * 60;
      setTimeLeft(seconds);
      setOriginalTime(seconds);
      setCustomTime(minutes.toString());
      setIsComplete(false);
      setShowGlow(false);
    }
    playButtonClick();
  };

  const handleCustomTime = () => {
    if (!isActive) {
      const minutes = parseInt(customTime);
      if (minutes > 0 && minutes <= 120) {
        // Max 2 hours
        const seconds = minutes * 60;
        setTimeLeft(seconds);
        setOriginalTime(seconds);
        setIsComplete(false);
        setShowGlow(false);
      }
    }
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
    playButtonClick();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (!isVisible) return null;

  return (
    <div className="pomodoro-overlay">
      <div className="pomodoro-container">
        <div className="pomodoro-header">
          <h2>Pomodoro Timer</h2>
          <div className="header-controls">
            <button
              className="settings-btn"
              onClick={toggleSettings}
              onMouseEnter={playButtonHover}
              title="Timer Settings"
            >
              ⚙️
            </button>
            <button
              className="close-btn"
              onClick={onClose}
              onMouseEnter={playButtonHover}
            >
              ×
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="pomodoro-settings">
            <h3>Timer Presets</h3>
            <div className="preset-buttons">
              <button
                className="preset-btn"
                onClick={() => handlePresetTime(25)}
                onMouseEnter={playButtonHover}
                disabled={isActive}
              >
                25 min
              </button>
              <button
                className="preset-btn"
                onClick={() => handlePresetTime(15)}
                onMouseEnter={playButtonHover}
                disabled={isActive}
              >
                15 min
              </button>
              <button
                className="preset-btn"
                onClick={() => handlePresetTime(5)}
                onMouseEnter={playButtonHover}
                disabled={isActive}
              >
                5 min
              </button>
              <button
                className="preset-btn"
                onClick={() => handlePresetTime(1)}
                onMouseEnter={playButtonHover}
                disabled={isActive}
              >
                1 min
              </button>
            </div>

            <div className="custom-timer">
              <label>Custom (1-120 min):</label>
              <div className="custom-input-group">
                <input
                  type="number"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  min="1"
                  max="120"
                  className="custom-time-input"
                  disabled={isActive}
                />
                <button
                  className="set-btn"
                  onClick={handleCustomTime}
                  onMouseEnter={playButtonHover}
                  disabled={isActive}
                >
                  Set
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="pomodoro-heart-container">
          <svg
            width="200"
            height="180"
            viewBox="0 0 200 180"
            className={`pomodoro-heart ${showGlow ? "glowing" : ""} ${
              isComplete ? "complete" : ""
            }`}
          >
            {/* Heart path definition */}
            <defs>
              <clipPath id="heartClip">
                <path d="M100,160 C80,130 20,100 20,60 C20,30 40,10 70,10 C85,10 100,20 100,20 C100,20 115,10 130,10 C160,10 180,30 180,60 C180,100 120,130 100,160 Z" />
              </clipPath>

              {/* Gradient for the fill */}
              <linearGradient id="heartFill" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>

            {/* Heart outline */}
            <path
              d="M100,160 C80,130 20,100 20,60 C20,30 40,10 70,10 C85,10 100,20 100,20 C100,20 115,10 130,10 C160,10 180,30 180,60 C180,100 120,130 100,160 Z"
              fill="none"
              stroke="var(--black)"
              strokeWidth="4"
            />

            {/* Heart fill - animated based on timer */}
            <rect
              x="0"
              y={180 - fillPercentage * 1.8}
              width="200"
              height={fillPercentage * 1.8}
              fill="url(#heartFill)"
              clipPath="url(#heartClip)"
              className="heart-fill"
            />

            {/* Inner heart outline for pixel effect */}
            <path
              d="M100,160 C80,130 20,100 20,60 C20,30 40,10 70,10 C85,10 100,20 100,20 C100,20 115,10 130,10 C160,10 180,30 180,60 C180,100 120,130 100,160 Z"
              fill="none"
              stroke="var(--darker-orange)"
              strokeWidth="2"
              strokeDasharray="4,2"
            />
          </svg>
        </div>

        <div className="pomodoro-display">
          <div className="time-display">{formatTime(timeLeft)}</div>

          {isComplete && (
            <div className="completion-message">🎉 Pomodoro Complete! 🎉</div>
          )}
        </div>

        <div className="pomodoro-controls">
          {!isActive ? (
            <button
              className="pomodoro-btn start-btn"
              onClick={handleStart}
              onMouseEnter={playButtonHover}
              disabled={isComplete}
            >
              {timeLeft === 60 ? "Start" : "Resume"}
            </button>
          ) : (
            <button
              className="pomodoro-btn pause-btn"
              onClick={handlePause}
              onMouseEnter={playButtonHover}
            >
              Pause
            </button>
          )}

          <button
            className="pomodoro-btn reset-btn"
            onClick={handleReset}
            onMouseEnter={playButtonHover}
          >
            Reset
          </button>
        </div>

        <div className="pomodoro-info">
          <p>
            Focus for {Math.ceil(originalTime / 60)} minute
            {Math.ceil(originalTime / 60) !== 1 ? "s" : ""} and watch the heart
            fill with productivity! 💚
          </p>
        </div>
      </div>
    </div>
  );
};
