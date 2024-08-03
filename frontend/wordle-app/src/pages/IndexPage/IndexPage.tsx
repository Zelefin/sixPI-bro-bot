import React, { useState, useEffect, useCallback } from "react";
import {
  useCloudStorage,
  useHapticFeedback,
  useLaunchParams,
} from "@telegram-apps/sdk-react";
import { WordleBoard } from "@/components/WordleBoard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTheme } from "@/components/ThemeContext";
import { GameOverPopup } from "@/components/GameOverPopup";
import "@/components/wordleKeyboard.css";
import { LetterStatus, CloudData, GuessResponse } from "@/types";

export const IndexPage: React.FC = () => {
  const { initDataRaw } = useLaunchParams();
  const cloudStorage = useCloudStorage();
  const hapticFeedback = useHapticFeedback();
  const { theme } = useTheme();

  // State
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [correctWord, setCorrectWord] = useState<string>("err");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<LetterStatus[][]>([]);
  const [letterStatuses, setLetterStatuses] = useState<
    Record<string, LetterStatus>
  >({});
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const [isGameOverPopupOpen, setIsGameOverPopupOpen] =
    useState<boolean>(false);

  // Cloud storage operations
  const getTodayKey = useCallback(async () => {
    try {
      const result = await cloudStorage.get("Today");
      if (result) {
        const parsedData: CloudData = JSON.parse(result);
        const storedDate = new Date(parsedData.date);
        const currentDate = new Date();

        if (isYesterdayOrEarlier(storedDate, currentDate)) {
          await deleteTodayKey();
        } else {
          setCorrectWord(parsedData.correctWord);
          setGuesses(parsedData.attempts);
          updateGameState(parsedData.attempts);
        }
      }
    } catch (error) {
      console.error("Error getting today's key:", error);
    }
  }, [cloudStorage]);

  const setTodayKey = useCallback(
    async (newAttempts: string[], cWord: string) => {
      try {
        const newCloudData: CloudData = {
          date: new Date().toISOString(),
          attempts: newAttempts,
          correctWord: cWord,
        };
        await cloudStorage.set("Today", JSON.stringify(newCloudData));
      } catch (error) {
        console.error("Error setting today's key:", error);
      }
    },
    [cloudStorage]
  );

  const deleteTodayKey = useCallback(async () => {
    try {
      await cloudStorage.delete("Today");
      resetGameState();
    } catch (error) {
      console.error("Error deleting today's key:", error);
    }
  }, [cloudStorage]);

  // Game logic
  const updateGameState = useCallback((attempts: string[]) => {
    const newStatuses: LetterStatus[][] = [];
    const newLetterStatuses: Record<string, LetterStatus> = {};

    attempts.forEach((attempt) => {
      const rowStatus: LetterStatus[] = [];
      attempt.split("").forEach((char, index) => {
        if (index % 2 === 0) {
          const status = getLetterStatus(char);
          rowStatus.push(status);
          updateLetterStatus(newLetterStatuses, attempt[index + 1], status);
        }
      });
      newStatuses.push(rowStatus);
    });

    setStatuses(newStatuses);
    setLetterStatuses(newLetterStatuses);
    checkGameOver(attempts);
  }, []);

  const handleKeyPress = useCallback(
    (key: string) => {
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
    },
    [gameOver, currentGuess]
  );

  const submitGuess = useCallback(async () => {
    try {
      const formData = new URLSearchParams();
      formData.append("_auth", initDataRaw || "");
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
        handleValidGuess(data);
      } else {
        alert("Error submitting guess. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting guess:", error);
      alert("An error occurred. Please try again.");
    }
  }, [currentGuess, initDataRaw, guesses]);

  // Helper functions
  const isYesterdayOrEarlier = (storedDate: Date, currentDate: Date) => {
    return (
      storedDate.getDate() < currentDate.getDate() ||
      storedDate.getMonth() < currentDate.getMonth() ||
      storedDate.getFullYear() < currentDate.getFullYear()
    );
  };

  const resetGameState = () => {
    setGuesses([]);
    setStatuses([]);
    setLetterStatuses({});
    setGameOver(false);
  };

  const getLetterStatus = (char: string): LetterStatus => {
    switch (char) {
      case "!":
        return "correct";
      case "?":
        return "misplaced";
      default:
        return "incorrect";
    }
  };

  const updateLetterStatus = (
    statusObj: Record<string, LetterStatus>,
    letter: string,
    status: LetterStatus
  ) => {
    if (
      status === "correct" ||
      (status === "misplaced" && statusObj[letter] !== "correct")
    ) {
      statusObj[letter] = status;
    } else if (!statusObj[letter]) {
      statusObj[letter] = status;
    }
  };

  const checkGameOver = (attempts: string[]) => {
    if (attempts.length > 0) {
      const lastAttempt = attempts[attempts.length - 1];
      if (
        lastAttempt
          .split("")
          .filter((_, i) => i % 2 === 0)
          .every((char) => char === "!")
      ) {
        setGameOver(true);
        setHasWon(true);
        setIsGameOverPopupOpen(true);
      } else if (attempts.length >= 6) {
        setGameOver(true);
        setHasWon(false);
        setIsGameOverPopupOpen(true);
      }
    }
  };

  const handleValidGuess = (data: GuessResponse) => {
    if (data.is_common) {
      const formattedGuess = data.word;
      const newGuesses = [...guesses, formattedGuess];
      setGuesses(newGuesses);
      setCurrentGuess("");
      // Correct word will be only avaliable if
      // user have sent exactly 6 requests to /guess.
      if (data.correct_word) {
        setCorrectWord(data.correct_word);
      }
      updateGameState(newGuesses);

      if (data.is_correct) {
        setGameOver(true);
        setHasWon(true);
        // But we still need to set it.
        // User can guess the word in less than 6 requests.
        setCorrectWord(convertToDisplayGuess(data.word));
        setIsGameOverPopupOpen(true);
        hapticFeedback.notificationOccurred("success");
      } else if (newGuesses.length >= 6) {
        setGameOver(true);
        setHasWon(false);
        setIsGameOverPopupOpen(true);
      }

      setTodayKey(
        newGuesses,
        data.correct_word
          ? data.correct_word
          : data.is_correct
          ? convertToDisplayGuess(data.word)
          : "_err"
      );
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      hapticFeedback.impactOccurred("medium");
    }
  };

  const closeGameOverPopup = () => {
    setIsGameOverPopupOpen(false);
  };

  const convertToDisplayGuess = (formattedGuess: string) => {
    return formattedGuess.replace(/[!?.]/g, "");
  };

  // Effects
  useEffect(() => {
    getTodayKey();
  }, [getTodayKey]);

  // Render
  return (
    <div
      className={`flex flex-col w-full flex-1 px-4 min-h-screen items-center justify-between h-screen bg-theme-bg-color ${theme}`}
    >
      <Header />
      <WordleBoard
        guesses={[...guesses.map(convertToDisplayGuess), currentGuess]}
        statuses={statuses}
        currentGuessIndex={guesses.length}
        shake={shake}
      />
      <Footer
        handleKeyPress={handleKeyPress}
        letterStatuses={letterStatuses}
        deleteTodayKey={deleteTodayKey}
      />
      <GameOverPopup
        isOpen={isGameOverPopupOpen}
        onClose={closeGameOverPopup}
        hasWon={hasWon}
        guessCount={guesses.length}
        correctWord={correctWord}
        guesses={guesses}
      />
    </div>
  );
};
