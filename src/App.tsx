import React, { useState, useEffect } from "react";
import { TodoPage, CalendarPage } from "./features";
import { TodoProvider, useTodoContext } from "./contexts/TodoContext";
import AnimatedBackground from "./components/AnimatedBackground";
import Window from "./components/Window";
import Taskbar from "./components/Taskbar";
import { Tutorial } from "./components/Tutorial";
import { Pomodoro } from "./components/Pomodoro";
import { SecureDataManager } from "./components/SecureDataManager";
import { useAudio } from "./hooks/useAudio";
import "./App.css";

const AppContent: React.FC = () => {
  const { todos, toggleTodo } = useTodoContext();
  const [currentView, setCurrentView] = useState<"todo" | "calendar" | null>(
    null
  );
  const [isMinimized, setIsMinimized] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [showSecureManager, setShowSecureManager] = useState(false);

  // Initialize audio system
  useAudio();

  // Check if user has seen tutorial before
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem("hasSeenTutorial", "true");
  };

  const startTutorial = () => {
    setShowTutorial(true);
  };

  const startPomodoro = () => {
    setShowPomodoro(true);
  };

  const closePomodoro = () => {
    setShowPomodoro(false);
  };

  const openSecureManager = () => {
    setShowSecureManager(true);
  };

  const closeSecureManager = () => {
    setShowSecureManager(false);
  };

  const openApp = (type: "todo" | "calendar") => {
    setCurrentView(type);
    setIsMinimized(false);
  };

  const closeApp = () => {
    setCurrentView(null);
    setIsMinimized(false);
  };

  const focusApp = () => {
    if (currentView) {
      setIsMinimized(false);
    }
  };

  const getWindowTitle = () => {
    if (!currentView) return "";
    return currentView === "todo" ? "Todo Manager" : "Calendar View";
  };

  return (
    <div className="desktop">
      <AnimatedBackground />

      {currentView && (
        <Window
          title={getWindowTitle()}
          isActive={!isMinimized}
          isMinimized={isMinimized}
          onFocus={focusApp}
          onClose={closeApp}
        >
          {currentView === "todo" ? (
            <TodoPage />
          ) : (
            <CalendarPage todos={todos} onToggleTodo={toggleTodo} />
          )}
        </Window>
      )}

      <Taskbar
        onCreateTodo={() => openApp("todo")}
        onCreateCalendar={() => openApp("calendar")}
        onStartTutorial={startTutorial}
        onStartPomodoro={startPomodoro}
        onOpenSecureManager={openSecureManager}
      />

      <Tutorial isVisible={showTutorial} onComplete={handleTutorialComplete} />
      <Pomodoro isVisible={showPomodoro} onClose={closePomodoro} />
      <SecureDataManager
        isVisible={showSecureManager}
        onClose={closeSecureManager}
      />
    </div>
  );
};

function App() {
  return (
    <TodoProvider>
      <AppContent />
    </TodoProvider>
  );
}

export default App;
