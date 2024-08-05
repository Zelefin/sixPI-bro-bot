import React, { useState, useEffect, useCallback, useRef } from "react";
import { LetterStatus } from "@/types";

interface CellDimensions {
  width: number;
  height: number;
  fontSize: number;
}

interface CellProps {
  letter: string;
  status: LetterStatus;
  shake: boolean;
  dimensions: CellDimensions;
}

const Cell: React.FC<CellProps> = ({ letter, status, shake, dimensions }) => {
  const bgColor = {
    correct: "bg-correct-letter-color",
    misplaced: "bg-misplaced-letter-color",
    incorrect: "bg-incorrect-letter-color",
    unused: "bg-theme-bg-color border-2 border-hint-color",
  }[status];

  return (
    <div
      className={`
        font-bold uppercase flex items-center justify-center
        ${bgColor}
        ${status !== "unused" ? "text-white" : "text-text-color"}
        ${shake ? "animate-shake" : ""}
      `}
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        fontSize: `${dimensions.fontSize}px`,
      }}
    >
      {letter}
    </div>
  );
};

interface WordleRowProps {
  word: string;
  statuses: LetterStatus[];
  shake: boolean;
  cellDimensions: CellDimensions;
}

const WordleRow: React.FC<WordleRowProps> = ({
  word,
  statuses,
  shake,
  cellDimensions,
}) => (
  <div className="flex flex-row items-center justify-center w-full gap-2 flex-nowrap">
    {Array(5)
      .fill(null)
      .map((_, index) => (
        <Cell
          key={index}
          letter={word[index] || ""}
          status={statuses[index] || "unused"}
          shake={shake}
          dimensions={cellDimensions}
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
  const boardRef = useRef<HTMLDivElement>(null);
  const [cellDimensions, setCellDimensions] = useState<CellDimensions>({
    width: 63,
    height: 63,
    fontSize: 37.8,
  });

  const calculateCellDimensions = useCallback(() => {
    if (boardRef.current) {
      const wordleBoardWidth = boardRef.current.clientWidth;
      const wordleBoardHeight = boardRef.current.clientHeight;

      // Calculate cellSize based on the provided algorithm
      const a = Math.min(
        Math.floor(wordleBoardWidth / 5) - 8,
        Math.floor(wordleBoardHeight / 6) - 8
      );
      const cellSize = Math.min(a, 128);

      // Set new cell dimensions
      setCellDimensions({
        width: cellSize,
        height: cellSize,
        fontSize: 0.6 * cellSize,
      });
    }
  }, []);

  useEffect(() => {
    calculateCellDimensions();
    // Set up a resize observer to recalculate on size changes
    const resizeObserver = new ResizeObserver(calculateCellDimensions);
    if (boardRef.current) {
      resizeObserver.observe(boardRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [calculateCellDimensions]);

  return (
    <div
      ref={boardRef}
      className="flex flex-col items-center justify-center max-w-4xl w-full gap-2 mt-2 flex-grow content-start min-h-0"
    >
      {Array(6)
        .fill(null)
        .map((_, index) => (
          <WordleRow
            key={index}
            word={guesses[index] || ""}
            statuses={statuses[index] || Array(5).fill("unused")}
            shake={shake && index === currentGuessIndex}
            cellDimensions={cellDimensions}
          />
        ))}
    </div>
  );
};
