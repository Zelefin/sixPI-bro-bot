import React, { useState, useCallback, useRef } from "react";

interface KeyboardProps {
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

export const Keyboard: React.FC<KeyboardProps> = ({
  onKeyPress,
  letterStatuses,
}) => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const keyPressedRef = useRef<{ [key: string]: boolean }>({});

  // Determine the color of a key based on its status
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

  // Handle key activation
  const handleKeyActivation = useCallback((key: string) => {
    setActiveKeys((prev) => new Set(prev).add(key));
    keyPressedRef.current[key] = true;
  }, []);

  // Handle key deactivation
  const handleKeyDeactivation = useCallback((key: string) => {
    setActiveKeys((prev) => {
      const newSet = new Set(prev);
      newSet.delete(key);
      return newSet;
    });
    keyPressedRef.current[key] = false;
  }, []);

  // Handle key press
  const handleKeyPress = useCallback(
    (key: string) => {
      if (keyPressedRef.current[key]) {
        onKeyPress(key);
        keyPressedRef.current[key] = false;
      }
    },
    [onKeyPress]
  );

  // Get styles for a key
  const getKeyStyles = useCallback(
    (letter: string, isSpecial: boolean = false) => {
      let baseStyle = `h-[40px] p-[5px] flex-1 rounded-[4px] font-bold text-base ${getKeyColor(
        letter
      )} border-b border-[#b3b5b4] active:border-b-0 active:translate-y-[1px] select-none touch-none`;

      if (isSpecial) {
        baseStyle += " flex-[1.5]";
        if (letter === "ENTER" && !activeKeys.has("ENTER")) {
          baseStyle += " !bg-blue-500 text-white";
        }
      }

      return baseStyle;
    },
    [getKeyColor]
  );

  // Handle touch start event
  const handleTouchStart = useCallback(
    (e: React.TouchEvent, key: string) => {
      e.preventDefault();
      handleKeyActivation(key);
      handleKeyPress(key);
    },
    [handleKeyActivation, handleKeyPress]
  );

  // Handle touch end event
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent, key: string) => {
      e.preventDefault();
      handleKeyDeactivation(key);
    },
    [handleKeyDeactivation]
  );

  // Render a single key button
  const renderKeyButton = useCallback(
    (letter: string, isSpecial: boolean = false) => (
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
        className={`${getKeyStyles(letter, isSpecial)} mx-0.5`}
      >
        {letter === "BACKSPACE" ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-1"
            width="28"
            height="28"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z"
            ></path>
          </svg>
        ) : (
          letter.toUpperCase()
        )}
      </button>
    ),
    [
      getKeyStyles,
      handleKeyActivation,
      handleKeyDeactivation,
      handleKeyPress,
      handleTouchStart,
      handleTouchEnd,
    ]
  );

  return (
    <div className="mt-3 w-full mx-auto rounded-lg select-none touch-none keyboard">
      {keyboardLayout.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-between mb-1 mx-1">
          {rowIndex === 2 && renderKeyButton("ENTER", true)}
          {row.map((letter) => renderKeyButton(letter))}
          {rowIndex === 2 && renderKeyButton("BACKSPACE", true)}
        </div>
      ))}
    </div>
  );
};
