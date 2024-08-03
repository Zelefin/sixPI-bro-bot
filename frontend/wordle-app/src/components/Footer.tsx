import React from "react";
import { LetterStatus } from "@/types";
import { WordleKeyboard } from "@/components/WordleKeyboard";

interface FooterProps {
  handleKeyPress: (key: string) => void;
  letterStatuses: Record<string, LetterStatus>;
  deleteTodayKey: () => Promise<void>;
}

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
  deleteTodayKey,
}) => (
  <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 w-screen z-10">
    <WordleKeyboard
      onKeyPress={handleKeyPress}
      letterStatuses={letterStatuses}
    />
    <ResetButton onClick={deleteTodayKey} />
  </div>
);
