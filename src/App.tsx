import React, { useState, useEffect } from "react";
import { TodoPage, CalendarPage } from "./features";
import { TodoProvider, useTodoContext } from "./contexts/TodoContext";
import AnimatedBackground from "./components/AnimatedBackground";
import Window from "./components/Window";
import Taskbar from "./components/Taskbar";
import { Tutorial } from "./components/Tutorial";
import { Pomodoro } from "./components/Pomodoro";
import { SecureDataManager } from "./components/SecureDataManager";
import { TabManager } from "./components/TabManager";
import { NotesManager } from "./components/NotesManager";
import { useAudio } from "./hooks/useAudio";
import "./App.css";

const AppContent: React.FC = () => {
  const { todos, toggleTodo } = useTodoContext();
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentWindow, setCurrentWindow] = useState<string | null>(null);

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

  const openWindow = (windowType: string) => {
    setCurrentWindow(windowType);
  };

  const closeWindow = () => {
    setCurrentWindow(null);
  };

  return (
    <div className="desktop">
      <AnimatedBackground />

      {/* Modal Components */}
      {currentWindow === "todo" && (
        <Window title="Todo Manager" isActive={true} onClose={closeWindow}>
          <TodoPage />
        </Window>
      )}
      {currentWindow === "calendar" && (
        <Window title="Calendar View" isActive={true} onClose={closeWindow}>
          <CalendarPage todos={todos} onToggleTodo={toggleTodo} />
        </Window>
      )}
      {currentWindow === "pomodoro" && (
        <Pomodoro isVisible={true} onClose={closeWindow} />
      )}
      {currentWindow === "secure" && (
        <SecureDataManager isVisible={true} onClose={closeWindow} />
      )}
      {currentWindow === "tabs" && (
        <TabManager isVisible={true} onClose={closeWindow} />
      )}
      {currentWindow === "notes" && (
        <NotesManager isVisible={true} onClose={closeWindow} />
      )}

      <Taskbar
        onCreateTodo={() => openWindow("todo")}
        onCreateCalendar={() => openWindow("calendar")}
        onStartTutorial={startTutorial}
        onStartPomodoro={() => openWindow("pomodoro")}
        onOpenSecureManager={() => openWindow("secure")}
        onOpenTabManager={() => openWindow("tabs")}
        onOpenNotesManager={() => openWindow("notes")}
      />

      <Tutorial isVisible={showTutorial} onComplete={handleTutorialComplete} />
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
