import React from "react";
import { LetterStatus } from "@/types";
import { WordleKeyboard } from "@/components/WordleKeyboard";

interface FooterProps {
  handleKeyPress: (key: string) => void;
  letterStatuses: Record<string, LetterStatus>;
  gameOver: boolean;
  guessesLength: number;
  deleteTodayKey: () => Promise<void>;
}

const GameOverMessage: React.FC<{ guessesLength: number }> = ({
  guessesLength,
}) => (
  <div className="mt-8 text-center text-text-color">
    <h2 className="text-2xl font-bold">Game Over!</h2>
    <p>You guessed the word in {guessesLength} tries.</p>
  </div>
);

const ResetButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="mt-4 px-4 py-2 bg-red-500 text-white rounded block mx-auto"
  >
    Reset Game (For development)
  </button>
);

export const Footer: React.FC<FooterProps> = ({
  handleKeyPress,
  letterStatuses,
  gameOver,
  guessesLength,
  deleteTodayKey,
}) => (
  <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 w-screen z-10">
    <WordleKeyboard
      onKeyPress={handleKeyPress}
      letterStatuses={letterStatuses}
    />
    {gameOver && <GameOverMessage guessesLength={guessesLength} />}
    <ResetButton onClick={deleteTodayKey} />
  </div>
);
