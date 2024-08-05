import React from "react";
import { LetterStatus } from "@/types";
import { WordleKeyboard } from "@/components/WordleKeyboard";

interface FooterProps {
  handleKeyPress: (key: string) => void;
  letterStatuses: Record<string, LetterStatus>;
}

export const Footer: React.FC<FooterProps> = ({
  handleKeyPress,
  letterStatuses,
}) => (
  <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 w-screen z-10">
    <WordleKeyboard
      onKeyPress={handleKeyPress}
      letterStatuses={letterStatuses}
    />
  </div>
);
