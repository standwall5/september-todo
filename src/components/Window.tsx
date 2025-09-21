import React from "react";
import { useAudio } from "../hooks/useAudio";
import "./Window.css";

interface WindowProps {
  title: string;
  children: React.ReactNode;
  isActive?: boolean;
  onFocus?: () => void;
  onClose?: () => void;
  isMinimized?: boolean;
}

const Window: React.FC<WindowProps> = ({
  title,
  children,
  isActive = true,
  onFocus,
  onClose,
  isMinimized = false,
}) => {
  const { playWindowClose, playButtonHover } = useAudio();

  const handleClose = () => {
    if (onClose) {
      playWindowClose();
      onClose();
    }
  };

  if (isMinimized) {
    return null; // Don't render minimized windows
  }

  return (
    <div
      className={`window ${isActive ? "active" : ""} centered-window`}
      onClick={onFocus}
    >
      <div className="window-header">
        <div className="window-title">{title}</div>
        <div className="window-controls">
          <button
            className="control-btn close"
            onClick={handleClose}
            onMouseEnter={playButtonHover}
          />
        </div>
      </div>
      <div className="window-content">{children}</div>
    </div>
  );
};

export default Window;
