import React from "react";
import "./AnimatedBackground.css";

const AnimatedBackground: React.FC = () => {
  return (
    <div className="animated-background">
      {/* Pixel art background by Adeptscreen */}
      <div className="pixel-art-background" />

      {/* Artist credit */}
      <div className="artist-credit">
        Art by{" "}
        <a
          href="https://www.pixilart.com/adeptscreen"
          target="_blank"
          rel="noopener noreferrer"
        >
          Adeptscreen
        </a>{" "}
        on Pixilart
      </div>
    </div>
  );
};

export default AnimatedBackground;
