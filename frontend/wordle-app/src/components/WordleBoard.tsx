import React from "react";

interface WordleRowProps {
  word: string;
  statuses: ("correct" | "misplaced" | "incorrect" | "unused")[];
  shake: boolean;
}

export const WordleRow: React.FC<WordleRowProps> = ({
  word,
  statuses,
  shake,
}) => {
  // Function to determine the background color of a letter based on its status
  const getLetterColor = (
    status: "correct" | "misplaced" | "incorrect" | "unused"
  ) => {
    switch (status) {
      case "correct":
        return "bg-correct-letter-color";
      case "misplaced":
        return "bg-misplaced-letter-color";
      case "incorrect":
        return "bg-incorrect-letter-color";
      default:
        return "bg-theme-bg-color border-2 border-hint-color";
    }
  };

  return (
    <div
      className={`flex justify-center my-2 ${shake ? "animate-row-shake" : ""}`}
    >
      {Array(5)
        .fill(null)
        .map((_, index) => (
          <div
            key={index}
            className={`w-[16vw] h-[16vw] flex items-center justify-center font-bold text-4xl ${getLetterColor(
              statuses[index]
            )} ${
              statuses[index] === "unused" ? "text-text-color" : "text-white"
            } mx-1`}
          >
            {word[index]?.toUpperCase() || ""}
          </div>
        ))}
    </div>
  );
};

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
  return (
    <div className="mb-6 w-full mx-auto">
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
  );
};
