import React, { useState } from "react";
import { useAudio } from "../hooks/useAudio";
import "./Taskbar.css";

interface TaskbarProps {
  onCreateTodo: () => void;
  onCreateCalendar: () => void;
  onStartTutorial: () => void;
  onStartPomodoro: () => void;
  onOpenSecureManager: () => void;
  onOpenTabManager: () => void;
  onOpenNotesManager: () => void;
}

const Taskbar: React.FC<TaskbarProps> = ({
  onCreateTodo,
  onCreateCalendar,
  onStartTutorial,
  onStartPomodoro,
  onOpenSecureManager,
  onOpenTabManager,
  onOpenNotesManager,
}) => {
  const [clickedButton, setClickedButton] = useState<string | null>(null);

  const {
    playButtonClick,
    playButtonHover,
    playWindowOpen,
    toggleBgmMute,
    toggleSfxMute,
    isBgmMuted,
    isSfxMuted,
  } = useAudio();

  const handleButtonClick = (buttonId: string, callback: () => void) => {
    setClickedButton(buttonId);
    callback();
    // Remove the clicked class after animation completes
    setTimeout(() => setClickedButton(null), 300);
  };

  const handleCreateTodo = () => {
    handleButtonClick("todo", () => {
      playWindowOpen();
      onCreateTodo();
    });
  };

  const handleCreateCalendar = () => {
    handleButtonClick("calendar", () => {
      playWindowOpen();
      onCreateCalendar();
    });
  };

  const handleStartTutorial = () => {
    handleButtonClick("tutorial", () => {
      playButtonClick();
      onStartTutorial();
    });
  };

  const handleToggleBgmMute = () => {
    handleButtonClick("bgm", () => {
      toggleBgmMute();
    });
  };

  const handleToggleSfxMute = () => {
    handleButtonClick("sfx", () => {
      toggleSfxMute();
    });
  };

  const handleStartPomodoro = () => {
    handleButtonClick("pomodoro", () => {
      playButtonClick();
      onStartPomodoro();
    });
  };

  const handleOpenSecureManager = () => {
    handleButtonClick("secure", () => {
      playButtonClick();
      onOpenSecureManager();
    });
  };

  const handleOpenTabManager = () => {
    handleButtonClick("tabs", () => {
      playButtonClick();
      onOpenTabManager();
    });
  };

  const handleOpenNotesManager = () => {
    handleButtonClick("notes", () => {
      playButtonClick();
      onOpenNotesManager();
    });
  };
  return (
    <div className="taskbar">
      <div className="taskbar-start">
        <div className="start-button">
          <span className="start-icon">🗂️</span>
          <span className="start-text">September</span>
        </div>
      </div>

      <div className="taskbar-center">
        <div className="app-launchers">
          <button
            className={`launcher-btn todo-launcher ${
              clickedButton === "todo" ? "clicked" : ""
            }`}
            onClick={handleCreateTodo}
            onMouseEnter={playButtonHover}
          >
            <img
              src="https://art.pixilart.com/8b694d265d632ab.png"
              alt="Todo"
              className="launcher-icon"
            />
            <span className="launcher-label">Todos</span>
          </button>
          <button
            className={`launcher-btn calendar-launcher ${
              clickedButton === "calendar" ? "clicked" : ""
            }`}
            onClick={handleCreateCalendar}
            onMouseEnter={playButtonHover}
          >
            <img
              src="https://art.pixilart.com/thumb/sr25f645d0471a8.png"
              alt="Calendar"
              className="launcher-icon"
            />
            <span className="launcher-label">Calendar</span>
          </button>
          <button
            className={`launcher-btn tutorial-launcher ${
              clickedButton === "tutorial" ? "clicked" : ""
            }`}
            onClick={handleStartTutorial}
            onMouseEnter={playButtonHover}
          >
            <span className="launcher-icon">🧙</span>
            <span className="launcher-label">Help</span>
          </button>
          <button
            className={`launcher-btn pomodoro-launcher ${
              clickedButton === "pomodoro" ? "clicked" : ""
            }`}
            onClick={handleStartPomodoro}
            onMouseEnter={playButtonHover}
          >
            <img
              src="https://art.pixilart.com/7ae9042b0e1cbcd.png"
              alt="Focus"
              className="launcher-icon"
            />
            <span className="launcher-label">Focus</span>
          </button>
          <button
            className={`launcher-btn security-launcher ${
              clickedButton === "secure" ? "clicked" : ""
            }`}
            onClick={handleOpenSecureManager}
            onMouseEnter={playButtonHover}
          >
            <img
              src="https://static.thenounproject.com/png/644041-200.png"
              alt="Secure"
              className="launcher-icon"
            />
            <span className="launcher-label">Secure</span>
          </button>
          <button
            className={`launcher-btn tabs-launcher ${
              clickedButton === "tabs" ? "clicked" : ""
            }`}
            onClick={handleOpenTabManager}
            onMouseEnter={playButtonHover}
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/1828/1828925.png"
              alt="Tabs"
              className="launcher-icon"
            />
            <span className="launcher-label">Tabs</span>
          </button>
          <button
            className={`launcher-btn notes-launcher ${
              clickedButton === "notes" ? "clicked" : ""
            }`}
            onClick={handleOpenNotesManager}
            onMouseEnter={playButtonHover}
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/2541/2541988.png"
              alt="Notes"
              className="launcher-icon"
            />
            <span className="launcher-label">Notes</span>
          </button>
        </div>
      </div>

      <div className="taskbar-end">
        <button
          className={`launcher-btn audio-toggle bgm-toggle ${
            clickedButton === "bgm" ? "clicked" : ""
          }`}
          onClick={handleToggleBgmMute}
          onMouseEnter={playButtonHover}
          title={isBgmMuted ? "Unmute BGM" : "Mute BGM"}
        >
          <span className="launcher-icon">{isBgmMuted ? "🎵❌" : "🎵"}</span>
        </button>

        <button
          className={`launcher-btn audio-toggle sfx-toggle ${
            clickedButton === "sfx" ? "clicked" : ""
          }`}
          onClick={handleToggleSfxMute}
          onMouseEnter={playButtonHover}
          title={isSfxMuted ? "Unmute SFX" : "Mute SFX"}
        >
          <span className="launcher-icon">{isSfxMuted ? "🔇" : "🔊"}</span>
        </button>

        <div className="system-info">
          <div className="time">
            {new Date().toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="date">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Taskbar;
