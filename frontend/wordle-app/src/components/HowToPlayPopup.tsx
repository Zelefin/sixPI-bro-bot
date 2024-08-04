import React, { useEffect, useState } from "react";
import { Popup } from "@/components/Popup";
import { WinAmountsResponse } from "@/types";

interface HowToPlayPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

// WinAmount component to fetch and display win amounts
const WinAmount: React.FC = () => {
  const [winAmounts, setWinAmounts] = useState<number[]>([]);

  useEffect(() => {
    const fetchWinAmounts = async () => {
      try {
        const response = await fetch("/wordle/amounts", {
          method: "GET",
        });

        const data: WinAmountsResponse = await response.json();
        setWinAmounts(data.win_amounts);
      } catch (error) {
        console.error("Error fetching win amounts:", error);
      }
    };
    fetchWinAmounts();
  }, []);

  return (
    <div>
      <h2 className="mt-4 text-xl">Win amounts</h2>
      <p className="mt-3">Win amount for every number of guesses:</p>

      <div className="mt-3">
        <ul className="space-y-2">
          {winAmounts.map((amount, index) => (
            <li
              key={index}
              className="flex items-center transition-all duration-300 hover:scale-102"
            >
              <div className="flex items-center">
                <span className="font-bold text-lg text-text-color">
                  {index + 1}
                </span>
                <span className="font-medium text-text-color mx-2">
                  {index === 0 ? "Guess:" : "Guesses:"}
                </span>
              </div>
              <span
                className={`font-semibold text-lg ${
                  index === 0
                    ? "animate-gradient-x bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-300% bg-clip-text text-transparent"
                    : index === 1
                    ? "animate-gradient-x bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-300% bg-clip-text text-transparent"
                    : "text-text-color"
                }`}
              >
                {amount}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-2">Guess one word every day and earn coins!</p>
    </div>
  );
};

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
        <div className="mt-3 grid grid-cols-5 gap-[2px] max-w-80">
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
        <div className="mt-3 grid grid-cols-5 gap-[2px] max-w-80">
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
        <div className="mt-3 grid grid-cols-5 gap-[2px] max-w-80">
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
      <WinAmount />
    </Popup>
  );
};
