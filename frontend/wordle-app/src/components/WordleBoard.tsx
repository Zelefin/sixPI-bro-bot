import React from "react";

interface WordleRowProps {
  word: string;
  statuses: ("correct" | "misplaced" | "incorrect" | "unused")[];
}

export const WordleRow: React.FC<WordleRowProps> = ({ word, statuses }) => {
  // Function to determine the background color of a letter based on its status
  const getLetterColor = (
    status: "correct" | "misplaced" | "incorrect" | "unused"
  ) => {
    switch (status) {
      case "correct":
        return "bg-green-500";
      case "misplaced":
        return "bg-yellow-500";
      case "incorrect":
        return "bg-gray-700";
      default:
        return "bg-gray-200";
    }
  };

  return (
    <div className="flex mb-4 justify-center">
      {Array(5)
        .fill(null)
        .map((_, index) => (
          <div
            key={index}
            className={`w-16 h-16 border-2 border-gray-300 flex items-center justify-center font-bold text-3xl ${getLetterColor(
              statuses[index]
            )} text-white mx-1.5 rounded-lg`}
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
}

export const WordleBoard: React.FC<WordleBoardProps> = ({
  guesses,
  statuses,
}) => {
  return (
    <div className="mb-6 w-full max-w-md mx-auto">
      {Array(6)
        .fill(null)
        .map((_, index) => (
          <WordleRow
            key={index}
            word={guesses[index] || ""}
            statuses={statuses[index] || Array(5).fill("unused")}
          />
        ))}
    </div>
  );
};
