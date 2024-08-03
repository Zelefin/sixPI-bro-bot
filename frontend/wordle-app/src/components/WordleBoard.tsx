import React from "react";
import { LetterStatus } from "@/types";

interface CellProps {
  letter: string;
  status: LetterStatus;
  shake: boolean;
}

const Cell: React.FC<CellProps> = ({ letter, status, shake }) => {
  const bgColor = {
    correct: "bg-correct-letter-color",
    misplaced: "bg-misplaced-letter-color",
    incorrect: "bg-incorrect-letter-color",
    unused: "bg-theme-bg-color border-2 border-hint-color",
  }[status];

  return (
    <div
      className={`
        aspect-square flex items-center justify-center text-[40px] font-bold uppercase
        ${bgColor}
        ${status !== "unused" ? "text-white" : "text-text-color"}
        ${shake ? "animate-shake" : ""}
      `}
    >
      {letter}
    </div>
  );
};

interface WordleRowProps {
  word: string;
  statuses: LetterStatus[];
  shake: boolean;
}

const WordleRow: React.FC<WordleRowProps> = ({ word, statuses, shake }) => (
  <div className="grid grid-cols-5 gap-2 w-full">
    {Array(5)
      .fill(null)
      .map((_, index) => (
        <Cell
          key={index}
          letter={word[index] || ""}
          status={statuses[index] || "unused"}
          shake={shake}
        />
      ))}
  </div>
);

interface WordleBoardProps {
  guesses: string[];
  statuses: LetterStatus[][];
  currentGuessIndex: number;
  shake: boolean;
}

export const WordleBoard: React.FC<WordleBoardProps> = ({
  guesses,
  statuses,
  currentGuessIndex,
  shake,
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto">
      <div className="flex flex-col gap-2 w-full">
        {Array(6)
          .fill(null)
          .map((_, index) => (
            <WordleRow
              key={index}
              word={guesses[index] || ""}
              statuses={statuses[index] || Array(5).fill("unused")}
              shake={shake && index === currentGuessIndex}
            />
          ))}
      </div>
    </div>
  );
};
