import React, { useState, useEffect, useRef } from "react";

interface CellProps {
  letter: string;
  status: "correct" | "misplaced" | "incorrect" | "unused";
  size: number;
  shake: boolean;
}

const Cell: React.FC<CellProps> = ({ letter, status, size, shake }) => {
  const bgColor = {
    correct: "bg-correct-letter-color",
    misplaced: "bg-misplaced-letter-color",
    incorrect: "bg-incorrect-letter-color",
    unused: "bg-theme-bg-color border-2 border-hint-color",
  }[status];

  return (
    <div
      className={`font-bold uppercase flex items-center justify-center ${bgColor} ${
        status !== "unused" ? "text-white" : "text-text-color"
      } ${shake ? "animate-shake" : ""}`}
      style={{
        width: size,
        height: size,
        fontSize: `${size * 0.6}px`,
      }}
    >
      {letter}
    </div>
  );
};

interface WordleRowProps {
  word: string;
  statuses: ("correct" | "misplaced" | "incorrect" | "unused")[];
  size: number;
  shake: boolean;
}

const WordleRow: React.FC<WordleRowProps> = ({
  word,
  statuses,
  size,
  shake,
}) => (
  <div className="flex justify-center gap-1">
    {Array(5)
      .fill(null)
      .map((_, index) => (
        <Cell
          key={index}
          letter={word[index] || ""}
          status={statuses[index]}
          size={size}
          shake={shake}
        />
      ))}
  </div>
);

interface WordleBoardProps {
  guesses: string[];
  statuses: ("correct" | "misplaced" | "incorrect" | "unused")[][];
  currentGuessIndex: number;
  shake: boolean;
}

export const WordleBoard: React.FC<WordleBoardProps> = ({
  guesses,
  statuses,
  currentGuessIndex,
  shake,
}) => {
  const [cellSize, setCellSize] = useState(60);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateCellSize = () => {
      if (boardRef.current) {
        const boardWidth = boardRef.current.offsetWidth;
        const boardHeight = boardRef.current.offsetHeight;
        const isLandscape = window.innerWidth > window.innerHeight;

        // Calculate cell size based on the smaller dimension
        const maxCellsInSmallestDimension = isLandscape ? 6 : 5;
        const smallestDimension = Math.min(boardWidth, boardHeight);
        const newSize = Math.floor(
          (smallestDimension - (maxCellsInSmallestDimension + 1) * 4) /
            maxCellsInSmallestDimension
        );

        // Limit the minimum cell size
        setCellSize(Math.max(newSize, 20)); // Minimum cell size of 20px
      }
    };

    updateCellSize();
    window.addEventListener("resize", updateCellSize);
    return () => window.removeEventListener("resize", updateCellSize);
  }, []);

  return (
    <div
      ref={boardRef}
      className="flex flex-col items-center justify-center w-full h-full max-w-sm mx-auto"
      style={{
        maxWidth: "90vw",
        maxHeight: "90vh",
      }}
    >
      <div className="flex flex-col gap-1">
        {Array(6)
          .fill(null)
          .map((_, index) => (
            <WordleRow
              key={index}
              word={guesses[index] || ""}
              statuses={statuses[index] || Array(5).fill("unused")}
              size={cellSize}
              shake={shake && index === currentGuessIndex}
            />
          ))}
      </div>
    </div>
  );
};
