import React, { useState, useEffect, useRef } from "react";
import { useAudio } from "../hooks/useAudio";
import "./Tutorial.css";

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  targetSelector?: string;
  position: "top" | "bottom" | "left" | "right" | "center";
  action?: "click" | "hover" | "none";
  highlight?: boolean;
  spotlight?: boolean;
}

interface TutorialProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "🗂️ Welcome to September!",
    content:
      "Let's take a quick tour of your new productivity workspace! This tutorial will show you all the amazing features available.",
    position: "center",
    action: "none",
  },
  {
    id: "taskbar-overview",
    title: "📊 Your Command Center",
    content:
      "This is your taskbar - your central hub for all applications. Notice the pixelated retro design that makes productivity fun!",
    targetSelector: ".app-launchers",
    position: "top",
    highlight: true,
  },
  {
    id: "start-button",
    title: "🗂️ September Start Button",
    content:
      "This is your September start button. While it looks familiar, it represents your personalized workspace identity.",
    targetSelector: ".start-button",
    position: "top",
    highlight: true,
    action: "hover",
  },
  {
    id: "todo-launcher",
    title: "✅ Todo Management",
    content:
      "Click here to create and manage your todos. Features include categories, priorities, due dates, and progress tracking.",
    targetSelector: '[data-icon-id="todo"]',
    position: "top",
    highlight: true,
    spotlight: true,
    action: "click",
  },
  {
    id: "calendar-launcher",
    title: "📅 Calendar & Scheduling",
    content:
      "Your calendar helps you schedule events, set reminders, and visualize your time. Perfect for planning ahead!",
    targetSelector: '[data-icon-id="calendar"]',
    position: "top",
    highlight: true,
    spotlight: true,
    action: "click",
  },
  {
    id: "notes-launcher",
    title: "📝 Notes & Documentation",
    content:
      "Capture thoughts, ideas, and important information. Organize notes in folders and keep everything searchable.",
    targetSelector: '[data-icon-id="notes"]',
    position: "top",
    highlight: true,
    spotlight: true,
    action: "click",
  },
  {
    id: "tabs-launcher",
    title: "🌐 Tab & Bookmark Manager",
    content:
      "Organize your web browsing! Save bookmark groups, manage tabs, and quick-launch your favorite sites.",
    targetSelector: '[data-icon-id="tabs"]',
    position: "top",
    highlight: true,
    spotlight: true,
    action: "click",
  },
  {
    id: "pomodoro-launcher",
    title: "⏱️ Focus Timer",
    content:
      "Stay productive with the Pomodoro technique! Set focus sessions, take breaks, and track your concentration.",
    targetSelector: '[data-icon-id="pomodoro"]',
    position: "top",
    highlight: true,
    spotlight: true,
    action: "click",
  },
  {
    id: "secure-launcher",
    title: "🔒 Secure Data Manager",
    content:
      "Export and import all your data securely with encryption. Your privacy is protected with local-only storage.",
    targetSelector: '[data-icon-id="secure"]',
    position: "top",
    highlight: true,
    spotlight: true,
    action: "click",
  },
  {
    id: "taskbar-drag",
    title: "🎯 Customize Your Layout",
    content:
      "Did you know? You can drag and drop these icons to rearrange them! Try dragging any icon anywhere on the screen - it will magnetically snap to position!",
    targetSelector: ".app-launchers",
    position: "top",
    highlight: true,
  },
  {
    id: "audio-controls",
    title: "🎵 Audio Controls",
    content:
      "Control your experience with background music and sound effects. Toggle them on/off as you prefer.",
    targetSelector: ".taskbar-end",
    position: "top",
    highlight: true,
  },
  {
    id: "system-info",
    title: "⏰ System Information",
    content:
      "Keep track of time and date. Your productivity workspace keeps you informed at a glance.",
    targetSelector: ".system-info",
    position: "left",
    highlight: true,
  },
  {
    id: "tutorial-launcher",
    title: "🧙 Help is Always Available",
    content:
      "Need help anytime? Click the wizard icon to restart this tutorial or get assistance with any feature.",
    targetSelector: '[data-icon-id="tutorial"]',
    position: "top",
    highlight: true,
    spotlight: true,
  },
  {
    id: "completion",
    title: "🎉 You're All Set!",
    content:
      "Congratulations! You've completed the September tour. Your data is automatically saved locally, and you can always access this tutorial again. Start being productive!",
    position: "center",
    action: "none",
  },
];

export const Tutorial: React.FC<TutorialProps> = ({
  isVisible,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [tooltipReady, setTooltipReady] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { playButtonClick, playButtonHover, playWindowOpen } = useAudio();

  const step = tutorialSteps[currentStep];

  // Position the tooltip relative to the target element
  const positionTooltip = () => {
    if (!tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    let left = 0,
      top = 0;
    let preferredPosition = step.position;

    // If no target selector, handle center positioning
    if (!step.targetSelector) {
      if (step.position === "center") {
        left = window.innerWidth / 2 - tooltipRect.width / 2;
        top = window.innerHeight / 2 - tooltipRect.height / 2;
      }
    } else {
      // Handle positioning relative to target element
      const targetElement = document.querySelector(
        step.targetSelector
      ) as HTMLElement;
      if (!targetElement) return;

      const targetRect = targetElement.getBoundingClientRect();

      // Smart positioning logic
      switch (preferredPosition) {
        case "top":
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          top = targetRect.top - tooltipRect.height - 15;

          // If tooltip would go above viewport, position below instead
          if (top < 10) {
            top = targetRect.bottom + 15;
            preferredPosition = "bottom";
          }
          break;
        case "bottom":
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          top = targetRect.bottom + 15;

          // If tooltip would go below viewport, position above instead
          if (top + tooltipRect.height > window.innerHeight - 10) {
            top = targetRect.top - tooltipRect.height - 15;
            preferredPosition = "top";
          }
          break;
        case "left":
          left = targetRect.left - tooltipRect.width - 15;
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;

          // If tooltip would go off left side, position right instead
          if (left < 10) {
            left = targetRect.right + 15;
            preferredPosition = "right";
          }
          break;
        case "right":
          left = targetRect.right + 15;
          top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;

          // If tooltip would go off right side, position left instead
          if (left + tooltipRect.width > window.innerWidth - 10) {
            left = targetRect.left - tooltipRect.width - 15;
            preferredPosition = "left";
          }
          break;
        case "center":
          left = window.innerWidth / 2 - tooltipRect.width / 2;
          top = window.innerHeight / 2 - tooltipRect.height / 2;
          break;
      }
    }

    // Final boundary checks to ensure tooltip is always visible
    left = Math.max(
      10,
      Math.min(left, window.innerWidth - tooltipRect.width - 10)
    );
    top = Math.max(
      10,
      Math.min(top, window.innerHeight - tooltipRect.height - 10)
    );

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;

    // Mark tooltip as ready to show
    setTooltipReady(true);
  };

  // Add highlighting to target element
  const addHighlight = () => {
    if (!step.targetSelector || !step.highlight) return;

    const targetElement = document.querySelector(
      step.targetSelector
    ) as HTMLElement;
    if (!targetElement) return;

    targetElement.classList.add("tutorial-highlight");
    if (step.spotlight) {
      targetElement.classList.add("tutorial-spotlight");
    }
    setIsHighlighting(true);
  };

  // Remove highlighting from all elements
  const removeHighlight = () => {
    // More comprehensive cleanup - search for both classes separately
    document
      .querySelectorAll(".tutorial-highlight, .tutorial-spotlight")
      .forEach((el) => {
        el.classList.remove("tutorial-highlight", "tutorial-spotlight");
      });
    setIsHighlighting(false);
  };

  // Reset to first step when tutorial opens and cleanup when it closes
  useEffect(() => {
    if (isVisible) {
      // Cancel any pending timeouts immediately
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Immediate and thorough cleanup when opening
      removeHighlight();
      setCurrentStep(0);
      setIsHighlighting(false);
      setTooltipReady(false);

      // Force DOM update and reset tooltip position
      requestAnimationFrame(() => {
        removeHighlight();
        // Reset tooltip position to force recalculation
        if (tooltipRef.current) {
          tooltipRef.current.style.left = "";
          tooltipRef.current.style.top = "";
        }
      });
    } else {
      // Cancel timeouts and clean up when tutorial closes
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      removeHighlight();
    }
  }, [isVisible]);

  // Immediate positioning when tooltip becomes available
  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      // Position immediately without delay
      positionTooltip();
    }
  }, [isVisible, currentStep]);

  // Handle step changes
  useEffect(() => {
    // Cancel any pending timeout first
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!isVisible) {
      // Ensure cleanup when not visible
      removeHighlight();
      return;
    }

    // Always clean up before applying new highlights
    removeHighlight();
    setTooltipReady(false);

    // Position immediately if tooltip exists
    if (tooltipRef.current) {
      positionTooltip();
    }

    timeoutRef.current = setTimeout(() => {
      // Only add highlighting if the step has a target selector
      if (step.targetSelector && step.highlight) {
        addHighlight();
      }
      timeoutRef.current = null;
    }, 150);

    // Handle window resize
    const handleResize = () => positionTooltip();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      removeHighlight();
    };
  }, [currentStep, isVisible]);

  // Cleanup effect on component unmount
  useEffect(() => {
    return () => {
      removeHighlight();
    };
  }, []);

  // Handle click interactions on target elements
  useEffect(() => {
    if (!isVisible || step.action !== "click" || !step.targetSelector) return;

    const targetElement = document.querySelector(
      step.targetSelector
    ) as HTMLElement;
    if (!targetElement) return;

    const handleTargetClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      playButtonClick();
      nextStep();
    };

    targetElement.addEventListener("click", handleTargetClick);
    targetElement.style.cursor = "pointer";
    targetElement.style.position = "relative";

    return () => {
      targetElement.removeEventListener("click", handleTargetClick);
      targetElement.style.cursor = "";
    };
  }, [currentStep, isVisible]);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      playButtonClick();
    } else {
      completeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      playButtonClick();
    }
  };

  const skipTutorial = () => {
    playButtonClick();
    onClose();
  };

  const completeTutorial = () => {
    removeHighlight();
    playWindowOpen();
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay with spotlight effect */}
      <div
        ref={overlayRef}
        className={`tutorial-overlay ${
          isHighlighting ? "tutorial-spotlighting" : ""
        }`}
        onClick={(e) => e.target === overlayRef.current && skipTutorial()}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="tutorial-tooltip"
        style={{
          opacity: tooltipReady ? 1 : 0,
          left: tooltipReady ? undefined : "-9999px",
          transition: tooltipReady ? "opacity 0.2s ease-in-out" : "none",
        }}
      >
        <div className="tutorial-header">
          <h3 className="tutorial-title">{step.title}</h3>
          <button
            className="tutorial-close"
            onClick={skipTutorial}
            onMouseEnter={playButtonHover}
          >
            ×
          </button>
        </div>

        <div className="tutorial-content">
          <p>{step.content}</p>
          {step.action === "click" && (
            <div className="tutorial-action-hint">
              <span className="tutorial-pointer">👆</span>
              <small>Click the highlighted element to continue</small>
            </div>
          )}
        </div>

        <div className="tutorial-controls">
          <div className="tutorial-progress">
            <span>
              {currentStep + 1} / {tutorialSteps.length}
            </span>
            <div className="tutorial-progress-bar">
              <div
                className="tutorial-progress-fill"
                style={{
                  width: `${((currentStep + 1) / tutorialSteps.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="tutorial-buttons">
            {currentStep > 0 && (
              <button
                className="tutorial-btn tutorial-prev"
                onClick={prevStep}
                onMouseEnter={playButtonHover}
              >
                ← Previous
              </button>
            )}

            {step.action !== "click" && (
              <button
                className="tutorial-btn tutorial-next"
                onClick={nextStep}
                onMouseEnter={playButtonHover}
              >
                {currentStep === tutorialSteps.length - 1
                  ? "Complete 🎉"
                  : "Next →"}
              </button>
            )}

            <button
              className="tutorial-btn tutorial-skip"
              onClick={skipTutorial}
              onMouseEnter={playButtonHover}
            >
              Skip Tutorial
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
