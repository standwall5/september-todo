import React, { useState, useEffect } from "react";
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
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Default icon order
  const defaultIconOrder = [
    "todo",
    "calendar",
    "tutorial",
    "pomodoro",
    "secure",
    "tabs",
    "notes",
  ];

  const [iconOrder, setIconOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem("taskbarIconOrder");
    return saved ? JSON.parse(saved) : defaultIconOrder;
  });

  // Save icon order to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("taskbarIconOrder", JSON.stringify(iconOrder));
  }, [iconOrder]);

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

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, iconId: string) => {
    setDraggedItem(iconId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent, iconId: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem !== iconId) {
      const targetElement = e.currentTarget as HTMLElement;
      targetElement.classList.add("drag-over");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const targetElement = e.currentTarget as HTMLElement;
    targetElement.classList.remove("drag-over");
  };

  const handleDrop = (e: React.DragEvent, targetIconId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetIconId) return;

    // Get positions for magnetic animation
    const draggedElement = document.querySelector(
      `[data-icon-id="${draggedItem}"]`
    ) as HTMLElement;
    const targetElement = document.querySelector(
      `[data-icon-id="${targetIconId}"]`
    ) as HTMLElement;

    if (draggedElement && targetElement) {
      const draggedRect = draggedElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();

      // Create a clone for the magnetic animation
      const clone = draggedElement.cloneNode(true) as HTMLElement;
      clone.classList.add("magnetic-clone");
      clone.style.position = "fixed";
      clone.style.left = `${draggedRect.left}px`;
      clone.style.top = `${draggedRect.top}px`;
      clone.style.width = `${draggedRect.width}px`;
      clone.style.height = `${draggedRect.height}px`;
      clone.style.zIndex = "10001";
      clone.style.pointerEvents = "none";

      document.body.appendChild(clone);

      // Hide the original element temporarily
      draggedElement.style.opacity = "0";

      // Animate the clone to the target position
      requestAnimationFrame(() => {
        clone.style.transition =
          "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        clone.style.left = `${targetRect.left}px`;
        clone.style.top = `${targetRect.top}px`;
        clone.style.transform = "scale(1.2) rotate(360deg)";

        setTimeout(() => {
          // Update the order
          const currentIndex = iconOrder.indexOf(draggedItem);
          const targetIndex = iconOrder.indexOf(targetIconId);

          const newOrder = [...iconOrder];
          newOrder.splice(currentIndex, 1);
          newOrder.splice(targetIndex, 0, draggedItem);

          setIconOrder(newOrder);

          // Clean up
          document.body.removeChild(clone);
          draggedElement.style.opacity = "";

          // Add final pop animation
          setTimeout(() => {
            const finalElement = document.querySelector(
              `[data-icon-id="${draggedItem}"]`
            ) as HTMLElement;
            if (finalElement) {
              finalElement.classList.add("magnetic-pop");
              setTimeout(() => {
                finalElement.classList.remove("magnetic-pop");
              }, 500);
            }
          }, 50);
        }, 400);
      });
    }

    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Icon configuration
  const iconConfigs = {
    todo: {
      onClick: handleCreateTodo,
      className: "todo-launcher",
      icon: "https://art.pixilart.com/8b694d265d632ab.png",
      label: "Todos",
      alt: "Todo",
    },
    calendar: {
      onClick: handleCreateCalendar,
      className: "calendar-launcher",
      icon: "https://art.pixilart.com/thumb/sr25f645d0471a8.png",
      label: "Calendar",
      alt: "Calendar",
    },
    tutorial: {
      onClick: handleStartTutorial,
      className: "tutorial-launcher",
      icon: "🧙",
      label: "Help",
      alt: "Tutorial",
    },
    pomodoro: {
      onClick: handleStartPomodoro,
      className: "pomodoro-launcher",
      icon: "https://art.pixilart.com/7ae9042b0e1cbcd.png",
      label: "Focus",
      alt: "Focus",
    },
    secure: {
      onClick: handleOpenSecureManager,
      className: "security-launcher",
      icon: "https://static.thenounproject.com/png/644041-200.png",
      label: "Secure",
      alt: "Secure",
    },
    tabs: {
      onClick: handleOpenTabManager,
      className: "tabs-launcher",
      icon: "https://cdn-icons-png.flaticon.com/512/1828/1828925.png",
      label: "Tabs",
      alt: "Tabs",
    },
    notes: {
      onClick: handleOpenNotesManager,
      className: "notes-launcher",
      icon: "https://cdn-icons-png.flaticon.com/512/2541/2541988.png",
      label: "Notes",
      alt: "Notes",
    },
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
          {iconOrder.map((iconId) => {
            const config = iconConfigs[iconId as keyof typeof iconConfigs];
            return (
              <button
                key={iconId}
                data-icon-id={iconId}
                className={`launcher-btn ${config.className} ${
                  clickedButton === iconId ? "clicked" : ""
                } ${draggedItem === iconId ? "dragging" : ""}`}
                onClick={config.onClick}
                onMouseEnter={playButtonHover}
                draggable
                onDragStart={(e) => handleDragStart(e, iconId)}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, iconId)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, iconId)}
                onDragEnd={handleDragEnd}
              >
                {typeof config.icon === "string" &&
                config.icon.startsWith("http") ? (
                  <img
                    src={config.icon}
                    alt={config.alt}
                    className="launcher-icon"
                  />
                ) : (
                  <span className="launcher-icon">{config.icon}</span>
                )}
                <span className="launcher-label">{config.label}</span>
              </button>
            );
          })}
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
