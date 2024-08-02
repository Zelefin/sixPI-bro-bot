import React, { useState, useEffect, useRef } from "react";
import {
  useCloudStorage,
  useHapticFeedback,
  useLaunchParams,
} from "@telegram-apps/sdk-react";
import { WordleKeyboard } from "@/components/WordleKeyboard";
import { WordleBoard } from "@/components/WordleBoard";
import { Player } from "@lottiefiles/react-lottie-player";
import UAflag from "./UAflag.json";
import "@/components/wordleKeyboard.css";

// Define the structure of the API response
interface GuessResponse {
  ok: boolean;
  is_correct: boolean;
  is_common: boolean;
  word: string;
}

// Define the structure of the cloud storage data
interface CloudData {
  date: string;
  attempts: string[];
}

export const IndexPage: React.FC = () => {
  const initDataRaw = useLaunchParams().initDataRaw;
  const cloudStorage = useCloudStorage();
  const hapticFeedback = useHapticFeedback();

  // State variables
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<
    ("correct" | "misplaced" | "incorrect" | "unused")[][]
  >([]);
  const [letterStatuses, setLetterStatuses] = useState<{
    [key: string]: "correct" | "misplaced" | "incorrect" | "unused";
  }>({});
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const playerRef = useRef<Player>(null);

  // Function to get today's key from cloud storage
  const getTodayKey = async () => {
    try {
      const result = await cloudStorage.get("Today");
      if (result) {
        const parsedData: CloudData = JSON.parse(result);
        const storedDate = new Date(parsedData.date);
        const currentDate = new Date();

        // Check if the stored date is from yesterday or earlier
        if (
          storedDate.getDate() < currentDate.getDate() ||
          storedDate.getMonth() < currentDate.getMonth() ||
          storedDate.getFullYear() < currentDate.getFullYear()
        ) {
          await deleteTodayKey();
        } else {
          setGuesses(parsedData.attempts);
          updateGameState(parsedData.attempts);
        }
      }
    } catch (error) {
      console.error("Error getting today's key:", error);
    }
  };

  // Function to set today's key in cloud storage
  const setTodayKey = async (newAttempts: string[]) => {
    try {
      const newCloudData: CloudData = {
        date: new Date().toISOString(),
        attempts: newAttempts,
      };
      await cloudStorage.set("Today", JSON.stringify(newCloudData));
    } catch (error) {
      console.error("Error setting today's key:", error);
    }
  };

  // Function to delete today's key from cloud storage
  const deleteTodayKey = async () => {
    try {
      await cloudStorage.delete("Today");
      setGuesses([]);
      setStatuses([]);
      setLetterStatuses({});
      setGameOver(false);
    } catch (error) {
      console.error("Error deleting today's key:", error);
    }
  };

  // Function to update the game state based on guesses
  const updateGameState = (attempts: string[]) => {
    const newStatuses: ("correct" | "misplaced" | "incorrect" | "unused")[][] =
      [];
    const newLetterStatuses: {
      [key: string]: "correct" | "misplaced" | "incorrect" | "unused";
    } = {};

    attempts.forEach((attempt) => {
      const rowStatus: ("correct" | "misplaced" | "incorrect" | "unused")[] =
        [];
      attempt.split("").forEach((char, index) => {
        if (index % 2 === 0) {
          switch (char) {
            case "!":
              rowStatus.push("correct");
              newLetterStatuses[attempt[index + 1]] = "correct";
              break;
            case "?":
              rowStatus.push("misplaced");
              if (newLetterStatuses[attempt[index + 1]] !== "correct") {
                newLetterStatuses[attempt[index + 1]] = "misplaced";
              }
              break;
            default:
              rowStatus.push("incorrect");
              if (!newLetterStatuses[attempt[index + 1]]) {
                newLetterStatuses[attempt[index + 1]] = "incorrect";
              }
          }
        }
      });
      newStatuses.push(rowStatus);
    });

    setStatuses(newStatuses);
    setLetterStatuses(newLetterStatuses);

    if (attempts.length > 0) {
      const lastAttempt = attempts[attempts.length - 1];
      if (
        lastAttempt
          .split("")
          .filter((_, i) => i % 2 === 0)
          .every((char) => char === "!")
      ) {
        setGameOver(true);
      } else if (attempts.length >= 6) {
        setGameOver(true);
      }
    }
  };

  // Function to handle key press on the virtual keyboard
  const handleKeyPress = (key: string) => {
    if (gameOver) return;

    if (key === "BACKSPACE") {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (key === "ENTER") {
      if (currentGuess.length === 5) {
        submitGuess();
      }
    } else if (currentGuess.length < 5) {
      setCurrentGuess((prev) => prev + key.toLowerCase());
    }
  };

  // Function to submit a guess
  const submitGuess = async () => {
    try {
      const formData = new URLSearchParams();
      formData.append("_auth", initDataRaw ? initDataRaw : "");
      formData.append("word", currentGuess);

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
        if (data.is_common) {
          const formattedGuess = data.word;
          console.log(formattedGuess);
          const newGuesses = [...guesses, formattedGuess];
          setGuesses(newGuesses);
          setCurrentGuess("");
          setTodayKey(newGuesses);
          updateGameState(newGuesses);

          if (data.is_correct) {
            setGameOver(true);
            hapticFeedback.notificationOccurred("success");
          } else if (newGuesses.length >= 6) {
            setGameOver(true);
          }
        } else {
          // Word is not common, shake the current guess row
          setShake(true);
          setTimeout(() => setShake(false), 500);
          hapticFeedback.impactOccurred("medium");
        }
      } else {
        alert("Error submitting guess. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting guess:", error);
      alert("An error occurred. Please try again.");
    }
  };

  // Function to convert formatted guess to display guess
  const convertToDisplayGuess = (formattedGuess: string) => {
    return formattedGuess.replace(/[!?.]/g, "");
  };

  useEffect(() => {
    getTodayKey();
  }, []);

  return (
    <div className="flex flex-col w-full flex-1 px-4 text-center min-h-screen items-center justify-between h-screen bg-theme-bg-color">
      <header className="flex flex-nowrap items-center justify-between max-w-4xl w-screen">
        <div className="p-4 text-lg font-bold basis-1/4 flex flex-row items-center justify-center gap-y-0">
          <h1 className="text-text-color">
            <div>Day</div>
            <div>#286</div>
          </h1>
        </div>
        <div
          className="p-4 text-2xl font-bold basis-1/2 center align-middle flex flex-row items-center justify-center gap-2"
          onClick={() => {
            if (playerRef.current) {
              playerRef.current.play();
            }
          }}
        >
          <div className="w-16 h-16">
            <Player src={UAflag} ref={playerRef} autoplay loop={false} />
          </div>
        </div>
        <div className="p-4 text-2xl font-bold text-hint-color basis-1/4 flex flex-row items-center justify-end gap-2">
          <button className="w-8 h-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="w-8 h-8"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
      </header>

      <WordleBoard
        guesses={[...guesses.map(convertToDisplayGuess), currentGuess]}
        statuses={statuses}
        currentGuessIndex={guesses.length}
        shake={shake}
      />

      <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 w-screen z-10">
        <WordleKeyboard
          onKeyPress={handleKeyPress}
          letterStatuses={letterStatuses}
        />

        {gameOver && (
          <div className="mt-8 text-center text-text-color">
            <h2 className="text-2xl font-bold">Game Over!</h2>
            <p>You guessed the word in {guesses.length} tries.</p>
          </div>
        )}

        <button
          onClick={() => {
            deleteTodayKey();
          }}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded block mx-auto"
        >
          Reset Game (For development)
        </button>
      </div>
    </div>
  );
};
