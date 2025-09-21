import React from "react";
import "./Navigation.css";

interface NavigationProps {
  currentView: "todo" | "calendar";
  onViewChange: (view: "todo" | "calendar") => void;
}

const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onViewChange,
}) => {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h2>September</h2>
        </div>
        <div className="nav-links">
          <button
            className={`nav-link ${currentView === "todo" ? "active" : ""}`}
            onClick={() => onViewChange("todo")}
          >
            📝 Todos
          </button>
          <button
            className={`nav-link ${currentView === "calendar" ? "active" : ""}`}
            onClick={() => onViewChange("calendar")}
          >
            📅 Calendar
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
