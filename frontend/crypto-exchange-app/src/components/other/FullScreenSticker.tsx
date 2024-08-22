import React, { useState, useRef, useEffect } from "react";
import { Player } from "@lottiefiles/react-lottie-player";

interface FullScreenStickerProps {
  stickerSrc: any; // JSON file for the sticker
  onClose: () => void;
}

export const FullScreenSticker: React.FC<FullScreenStickerProps> = ({
  stickerSrc,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const playerRef = useRef<Player>(null);

  useEffect(() => {
    // Start the grow animation when the component mounts
    setIsVisible(true);

    // Disable scrolling when the component mounts
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    // Re-enable scrolling when the component unmounts
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.touchAction = "unset";
    };
  }, []);

  const handleAnimationComplete = () => {
    if (isAnimating) {
      // When the grow animation is complete, play the sticker
      playerRef.current?.play();
    } else {
      // When the shrink animation is complete, call onClose
      onClose();
    }
  };

  const handleStickerComplete = () => {
    // When the sticker animation is complete, start the shrink animation
    setIsAnimating(false);
    setIsVisible(false);
  };

  // Prevent default behavior for touch events
  const preventDefault = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-0"
      }`}
      style={{
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)",
      }}
      onTouchMove={preventDefault}
      onTouchStart={preventDefault}
      onTouchEnd={preventDefault}
    >
      <div
        className={`relative transition-all duration-500 ${
          isAnimating ? "animate-grow" : "animate-shrink"
        }`}
        onAnimationEnd={handleAnimationComplete}
      >
        <Player
          ref={playerRef}
          src={stickerSrc}
          style={{ width: "80vmin", height: "80vmin" }}
          loop={false}
          onEvent={(event) => {
            if (event === "complete") handleStickerComplete();
          }}
        />
      </div>
    </div>
  );
};
