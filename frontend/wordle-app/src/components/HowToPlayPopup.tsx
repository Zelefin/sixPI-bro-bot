import React from "react";
import { Popup } from "@/components/Popup";

interface HowToPlayPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayPopup: React.FC<HowToPlayPopupProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Popup isOpen={isOpen} onClose={onClose} header="How to play">
      <p className="font-2xl">Guess the word in 6 tries</p>
      <ul className="list-disc list-inside mt-4">
        <li>Each guess must be a valid 5-letter word</li>
        <li>
          The color of the tiles will change to show how close your guess was to
          the word
        </li>
      </ul>
      <h2 className="mt-4 text-xl">Examples</h2>
      <div>
        <div className="mt-3 grid grid-cols-5 gap-[2px]">
          {["W", "E", "A", "R", "Y"].map((letter, index) => (
            <div
              key={index}
              className={`w-10 h-10 flex items-center border justify-center font-bold text-text-color ${
                index === 0
                  ? "bg-correct-letter-color text-white"
                  : "bg-theme-bg-color"
              }`}
            >
              {letter}
            </div>
          ))}
        </div>
        <p>
          <strong>W</strong> is in the word and in the correct spot
        </p>
        <div className="mt-3 grid grid-cols-5 gap-[2px]">
          {["P", "I", "L", "L", "S"].map((letter, index) => (
            <div
              key={index}
              className={`w-10 h-10 flex items-center border justify-center font-bold text-text-color ${
                index === 1
                  ? "bg-misplaced-letter-color text-white"
                  : "bg-theme-bg-color"
              }`}
            >
              {letter}
            </div>
          ))}
        </div>
        <p>
          <strong>I</strong> is in the word but in the wrong spot
        </p>
        <div className="mt-3 grid grid-cols-5 gap-[2px]">
          {["V", "A", "G", "U", "E"].map((letter, index) => (
            <div
              key={index}
              className={`w-10 h-10 flex items-center border justify-center font-bold text-text-color ${
                index === 3
                  ? "bg-incorrect-letter-color text-white"
                  : "bg-theme-bg-color"
              }`}
            >
              {letter}
            </div>
          ))}
        </div>
        <p>
          <strong>U</strong> is not in the word in any spot
        </p>
      </div>
    </Popup>
  );
};
