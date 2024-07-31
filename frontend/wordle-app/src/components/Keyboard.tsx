import React, { useState, useCallback, useRef } from "react";

interface UkrainianKeyboardProps {
  onKeyPress: (key: string) => void;
  letterStatuses: {
    [key: string]: "correct" | "misplaced" | "incorrect" | "unused";
  };
}

const keyboardLayout = [
  ["й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х", "ї"],
  ["ф", "і", "в", "а", "п", "р", "о", "л", "д", "ж", "є"],
  ["я", "ч", "с", "м", "и", "т", "ь", "б", "ю"],
];

export const Keyboard: React.FC<UkrainianKeyboardProps> = ({
  onKeyPress,
  letterStatuses,
}) => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const keyPressedRef = useRef<{ [key: string]: boolean }>({});

  const getKeyColor = useCallback(
    (letter: string) => {
      if (activeKeys.has(letter)) {
        return "bg-clicked-default-letter-color text-black";
      }
      switch (letterStatuses[letter]) {
        case "correct":
          return "bg-correct-letter-color text-white";
        case "misplaced":
          return "bg-misplaced-letter-color text-white";
        case "incorrect":
          return "bg-incorrect-letter-color text-white";
        default:
          return "bg-default-letter-color text-black";
      }
    },
    [activeKeys, letterStatuses]
  );

  const handleKeyActivation = useCallback((key: string) => {
    setActiveKeys((prev) => new Set(prev).add(key));
    keyPressedRef.current[key] = true;
  }, []);

  const handleKeyDeactivation = useCallback((key: string) => {
    setActiveKeys((prev) => {
      const newSet = new Set(prev);
      newSet.delete(key);
      return newSet;
    });
  }, []);

  const handleKeyPress = useCallback(
    (key: string) => {
      if (keyPressedRef.current[key]) {
        onKeyPress(key);
        keyPressedRef.current[key] = false;
      }
    },
    [onKeyPress]
  );

  // Updated getKeyStyles function with the new bottom border
  const getKeyStyles = useCallback(
    (letter: string) => {
      return `h-[40px] p-[5px] flex-1 rounded-[4px] font-bold text-base ${getKeyColor(
        letter
      )} border-b border-[#b3b5b4] active:border-b-0 active:translate-y-[1px] select-none touch-none`;
    },
    [getKeyColor]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, key: string) => {
      e.preventDefault();
      handleKeyActivation(key);
    },
    [handleKeyActivation]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent, key: string) => {
      e.preventDefault();
      handleKeyDeactivation(key);
      handleKeyPress(key);
    },
    [handleKeyDeactivation, handleKeyPress]
  );

  return (
    <div className="mt-3 w-full mx-auto rounded-lg select-none touch-none">
      {keyboardLayout.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-between mb-1.5 mx-1">
          {rowIndex === 2 && (
            <button
              onMouseDown={() => handleKeyActivation("ENTER")}
              onMouseUp={() => {
                handleKeyDeactivation("ENTER");
                handleKeyPress("ENTER");
              }}
              onMouseLeave={() => handleKeyDeactivation("ENTER")}
              onTouchStart={(e) => handleTouchStart(e, "ENTER")}
              onTouchEnd={(e) => handleTouchEnd(e, "ENTER")}
              // Updated className for ENTER button with new bottom border
              className={`h-[40px] p-[5px] flex-[1.5] mx-0.5 font-bold text-base ${
                activeKeys.has("ENTER")
                  ? "bg-clicked-default-letter-color text-black"
                  : "bg-blue-500 text-white"
              } rounded-[4px] border-b border-[#b3b5b4] active:border-b-0 active:translate-y-[1px] select-none touch-none`}
            >
              ENTER
            </button>
          )}
          {row.map((letter) => (
            <button
              key={letter}
              onMouseDown={() => handleKeyActivation(letter)}
              onMouseUp={() => {
                handleKeyDeactivation(letter);
                handleKeyPress(letter);
              }}
              onMouseLeave={() => handleKeyDeactivation(letter)}
              onTouchStart={(e) => handleTouchStart(e, letter)}
              onTouchEnd={(e) => handleTouchEnd(e, letter)}
              className={`${getKeyStyles(letter)} mx-0.5`}
            >
              {letter.toUpperCase()}
            </button>
          ))}
          {rowIndex === 2 && (
            <button
              onMouseDown={() => handleKeyActivation("BACKSPACE")}
              onMouseUp={() => {
                handleKeyDeactivation("BACKSPACE");
                handleKeyPress("BACKSPACE");
              }}
              onMouseLeave={() => handleKeyDeactivation("BACKSPACE")}
              onTouchStart={(e) => handleTouchStart(e, "BACKSPACE")}
              onTouchEnd={(e) => handleTouchEnd(e, "BACKSPACE")}
              // Updated className for BACKSPACE button with new bottom border
              className={`h-[40px] p-[5px] flex-[1.5] mx-0.5 text-lg ${getKeyColor(
                "BACKSPACE"
              )} rounded-[4px] border-b border-[#b3b5b4] active:border-b-0 active:translate-y-[1px] flex items-center justify-center select-none touch-none`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-1"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
                <line x1="18" y1="9" x2="12" y2="15"></line>
                <line x1="12" y1="9" x2="18" y2="15"></line>
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
