import React, { useState, useEffect } from "react";
import { Popup } from "./Popup";
import { useUtils } from "@telegram-apps/sdk-react";
import { calculateDayNumber } from "@/utils/dayCalculator";
import Confetti from "react-confetti";

interface GameOverPopupProps {
  isOpen: boolean;
  onClose: () => void;
  hasWon: boolean;
  guessCount: number;
  correctWord: string;
  guesses: string[];
}

export const GameOverPopup: React.FC<GameOverPopupProps> = ({
  isOpen,
  onClose,
  hasWon,
  guessCount,
  correctWord,
  guesses,
}) => {
  const header = hasWon ? "Congratulations!" : "Maybe next time?";
  const [timeUntilMidnight, setTimeUntilMidnight] = useState<string>("");
  const [showConfetti, setShowConfetti] = useState(false);
  const utils = useUtils();

  // Function to convert guesses to emojis
  const guessesToEmoji = (guesses: string[]): string => {
    return guesses
      .map((guess) =>
        guess
          .split("")
          .filter((_, index) => index % 2 === 0)
          .map((char) => {
            switch (char) {
              case "!":
                return "🟩";
              case "?":
                return "🟨";
              default:
                return "⬛";
            }
          })
          .join("")
      )
      .join("\n");
  };

  // Function to update the countdown timer
  const updateCountdown = () => {
    const now = new Date();
    const kyivTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Europe/Kiev" })
    );
    const midnight = new Date(kyivTime);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight.getTime() - kyivTime.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeUntilMidnight(
      `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    );
  };

  // Effect to start and update the countdown timer
  useEffect(() => {
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setShowConfetti(hasWon);
  }, [hasWon]);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Function to copy emojis to clipboard
  const copyEmojis = () => {
    const emojiResult = guessesToEmoji(guesses);
    navigator.clipboard.writeText(emojiResult);
    alert("Copied to clipboard!");
  };

  const shareResult = () => {
    const dayNumber = calculateDayNumber();
    const emojiResult = guessesToEmoji(guesses);
    const shareText = `Day #${dayNumber}\n${emojiResult}`;
    utils.shareURL("🇺🇦 Wordle!", shareText);
  };

  return (
    <>
      {showConfetti ? (
        <Confetti className="!z-[51]" gravity={0.15} recycle={false} />
      ) : null}
      <Popup isOpen={isOpen} onClose={onClose} header={header}>
        {hasWon ? (
          <p>
            You've guessed the word{" "}
            <b className="animate-gradient-x bg-gradient-to-r from-green-600 via-emerald-400 to-green-600 bg-300% bg-clip-text text-transparent">
              {correctWord}
            </b>{" "}
            in {guessCount} {guessCount === 1 ? "try" : "tries"}!
          </p>
        ) : (
          <p>
            The word was{" "}
            <b className="animate-gradient-x bg-gradient-to-r from-gray-300 via-gray-600 to-gray-300 bg-300% bg-clip-text text-transparent">
              {correctWord}
            </b>
            . Try again tomorrow!
          </p>
        )}

        <p className="mt-4">
          Come tomorrow to play again! New word will be available in:
        </p>

        <p className="text-2xl font-bold">{timeUntilMidnight}</p>

        <pre className="text-2xl mt-4">{guessesToEmoji(guesses)}</pre>
        <div className="flex flex-wrap items-center justify-center mt-4 content-start gap-4">
          <button
            className="flex items-center bg-button-color text-button-text-color border-2 border-button-color font-bold py-2 px-4 rounded mt-4"
            onClick={shareResult}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="w-6 h-6 inline-block"
            >
              <path
                fillRule="evenodd"
                d="M15.75 4.5a3 3 0 11.825 2.066l-8.421 4.679a3.002 3.002 0 010 1.51l8.421 4.679a3 3 0 11-.729 1.31l-8.421-4.678a3 3 0 110-4.132l8.421-4.679a3 3 0 01-.096-.755z"
                clipRule="evenodd"
              ></path>
            </svg>
            <p className="ml-1">Share</p>
          </button>
          <button
            className="flex items-center bg-transparent text-button-color border-button-color border-2 font-bold py-2 px-4 rounded mt-4"
            onClick={copyEmojis}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="w-6 h-6 inline-block"
            >
              <path
                fillRule="evenodd"
                d="M10.5 3A1.501 1.501 0 009 4.5h6A1.5 1.5 0 0013.5 3h-3zm-2.693.178A3 3 0 0110.5 1.5h3a3 3 0 012.694 1.678c.497.042.992.092 1.486.15 1.497.173 2.57 1.46 2.57 2.929V19.5a3 3 0 01-3 3H6.75a3 3 0 01-3-3V6.257c0-1.47 1.073-2.756 2.57-2.93.493-.057.989-.107 1.487-.15z"
                clipRule="evenodd"
              ></path>
            </svg>
            <p className="ml-1">Copy</p>
          </button>
        </div>
      </Popup>
    </>
  );
};
