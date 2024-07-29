import { useLaunchParams } from "@telegram-apps/sdk-react";
import React, { useState } from "react";

// Define the structure of the API response
interface GuessResponse {
  ok: boolean;
  result: string;
  correct_letters: [number, string][];
  misplaced_letters: [number, string][];
  incorrect_letters: [number, string][];
  is_correct: boolean;
}

export const IndexPage: React.FC = () => {
  const initDataRaw = useLaunchParams().initDataRaw;

  // State variables
  const [guess, setGuess] = useState<string>("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<GuessResponse | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Function to submit a guess
  const submitGuess = async () => {
    if (guess.length !== 5) {
      alert("Please enter a 5-letter word.");
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append("_auth", initDataRaw ? initDataRaw : "");
      formData.append("word", guess);

      const response = await fetch("/wordle/guess", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "ngrok-skip-browser-warning": "69420",
        },
        body: formData,
      });

      const data: GuessResponse = await response.json();

      if (data.ok) {
        setFeedback(data);
        setGuesses([...guesses, guess]);
        setGuess("");

        if (data.is_correct) {
          setGameOver(true);
        }
      } else {
        alert("Error submitting guess. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting guess:", error);
      alert("An error occurred. Please try again.");
    }
  };

  // Function to render a single guess with color-coded feedback
  const renderGuess = (guessWord: string, index: number) => {
    return (
      <div key={index} className="flex mb-2">
        {guessWord.split("").map((letter, letterIndex) => {
          let backgroundColor = "bg-gray-300"; // Default color for incorrect letters

          if (feedback && guesses[guesses.length - 1] === guessWord) {
            if (feedback.correct_letters.some(([i, _]) => i === letterIndex)) {
              backgroundColor = "bg-green-500";
            } else if (
              feedback.misplaced_letters.some(([i, _]) => i === letterIndex)
            ) {
              backgroundColor = "bg-yellow-500";
            }
          }

          return (
            <div
              key={letterIndex}
              className={`w-10 h-10 flex items-center justify-center font-bold text-black ${backgroundColor} mr-1`}
            >
              {letter.toUpperCase()}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Wordle Game</h1>

      {/* Display previous guesses */}
      <div className="mb-4">
        {guesses.map((guessWord, index) => renderGuess(guessWord, index))}
      </div>

      {/* Input for new guess */}
      <div className="mb-4">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value.toLowerCase())}
          maxLength={5}
          className="border-2 border-gray-300 rounded px-4 py-2 mr-2"
          placeholder="Enter 5-letter word"
          disabled={gameOver}
        />
        <button
          onClick={submitGuess}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={gameOver}
        >
          Guess
        </button>
      </div>

      {/* Feedback message */}
      {feedback && (
        <div className="mt-4">
          {feedback.result === "NotCommon" ? (
            <p className="text-red-500">Word is not in the list. Try again.</p>
          ) : feedback.is_correct ? (
            <p className="text-green-500">
              Congratulations! You guessed the word!
            </p>
          ) : (
            <p className="text-blue-500">Good try! Keep guessing.</p>
          )}
        </div>
      )}

      {/* Game over message */}
      {gameOver && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold">Game Over!</h2>
          <p>You guessed the word in {guesses.length} tries.</p>
        </div>
      )}
    </div>
  );
};
