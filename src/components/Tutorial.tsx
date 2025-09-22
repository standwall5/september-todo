import React, { useState } from "react";
import "./ModalWindow.css";
import "./Tutorial.css";

interface TutorialStep {
  id: number;
  title: string;
  message: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Welcome, Traveler!",
    message:
      "Greetings! I am the Todo Wizard. Let me guide you through this magical productivity realm...",
  },
  {
    id: 2,
    title: "The Todo Scroll",
    message:
      "In the Todo section, you can create and manage your daily quests. Add tasks, mark them complete, and track your progress!",
  },
  {
    id: 3,
    title: "The Calendar Crystal",
    message:
      "The Calendar shows your tasks across time. Click on any date to see what adventures await that day!",
  },
  {
    id: 4,
    title: "The Time Sectograph",
    message:
      "Soon you'll see a magical time wheel that shows how your tasks are distributed across the 24 hours of each day!",
  },
  {
    id: 5,
    title: "Your Quest Begins",
    message:
      "Now go forth and organize your tasks, young adventurer! May your productivity be ever flourishing!",
  },
];

interface TutorialProps {
  isVisible: boolean;
  onComplete: () => void;
}

export const Tutorial: React.FC<TutorialProps> = ({
  isVisible,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isVisible) return null;

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = tutorialSteps[currentStep];

  return (
    <div className="tutorial-dialogue">
      <div className="tutorial-header">
        <h2 className="tutorial-title">{step.title}</h2>
        <div className="tutorial-controls">
          <div className="step-indicator">
            Step {currentStep + 1} of {tutorialSteps.length}
          </div>
          <button
            className="tutorial-close-btn"
            onClick={handleSkip}
            title="Close Tutorial"
          >
            ×
          </button>
        </div>
      </div>

      <div className="tutorial-content">
        <div className="wizard-portrait">
          <img
            src="https://64.media.tumblr.com/28bcdd634a990320b37172620c4df284/4367169f797b42ff-74/s500x750/7906e92d1dc71d8c572d9758facd38cdcf492f11.png"
            alt="Todo Wizard"
            className="wizard-image"
          />
        </div>

        <div className="dialogue-content">
          <div className="dialogue-message">
            <p>{step.message}</p>
          </div>

          <div className="dialogue-controls">
            <button className="tutorial-btn skip-btn" onClick={handleSkip}>
              Skip
            </button>

            <div className="navigation-buttons">
              {currentStep > 0 && (
                <button
                  className="tutorial-btn prev-btn"
                  onClick={handlePrevious}
                >
                  Previous
                </button>
              )}

              <button className="tutorial-btn next-btn" onClick={handleNext}>
                {currentStep < tutorialSteps.length - 1 ? "Next" : "Finish"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
