import React, { useState } from "react";

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
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const getKeyColor = (letter: string) => {
    switch (letterStatuses[letter]) {
      case "correct":
        return "bg-green-500";
      case "misplaced":
        return "bg-yellow-500";
      case "incorrect":
        return "bg-gray-700";
      default:
        return "bg-gray-300";
    }
  };

  const handleKeyPress = (key: string) => {
    setPressedKey(key);
    onKeyPress(key);
    setTimeout(() => setPressedKey(null), 100);
  };

  const getKeyStyles = (letter: string) => {
    const baseStyles = `w-10 h-14 mx-0.5 mb-2 rounded-lg font-bold text-lg ${getKeyColor(
      letter
    )} text-white transition-all duration-100 ease-in-out`;
    return pressedKey === letter
      ? `${baseStyles} opacity-80 transform scale-95`
      : baseStyles;
  };

  return (
    <div className="mt-6 w-full max-w-md mx-auto">
      {keyboardLayout.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center mb-1">
          {row.map((letter) => (
            <button
              key={letter}
              onClick={() => handleKeyPress(letter)}
              className={getKeyStyles(letter)}
            >
              {letter.toUpperCase()}
            </button>
          ))}
        </div>
      ))}
      <div className="flex justify-between mt-1">
        <button
          onClick={() => handleKeyPress("ENTER")}
          className={`w-20 h-14 rounded-lg font-bold text-lg bg-gray-500 text-white ${
            pressedKey === "ENTER" ? "opacity-80 transform scale-95" : ""
          } transition-all duration-100 ease-in-out`}
        >
          ENTER
        </button>
        <button
          onClick={() => handleKeyPress("BACKSPACE")}
          className={`w-20 h-14 rounded-lg font-bold text-lg bg-gray-500 text-white ${
            pressedKey === "BACKSPACE" ? "opacity-80 transform scale-95" : ""
          } transition-all duration-100 ease-in-out`}
        >
          ←
        </button>
      </div>
    </div>
  );
};
