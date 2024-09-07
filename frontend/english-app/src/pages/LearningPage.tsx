import React from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { WordPrompt } from "../components/WordPrompt";
import { LearningProgress } from "../components/LearningProgress";
import { CompletionMessage } from "../components/CompletionMessage";
import { Unit, WordAttempt } from "../types";

// Custom hooks
const useLearningState = (unit: Unit | undefined) => {
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
  const [userInput, setUserInput] = React.useState("");
  const [wordAttempts, setWordAttempts] = React.useState<WordAttempt[]>([]);
  const [isLearningComplete, setIsLearningComplete] = React.useState(false);

  const words = Object.entries(unit?.words || {});

  const handleSubmit = () => {
    if (!userInput.trim()) return;

    const [english, ukrainian] = words[currentWordIndex];
    const isCorrect = userInput.toLowerCase().trim() === english.toLowerCase();

    setWordAttempts((prev) => [
      { ukrainian, english, userAnswer: userInput, isCorrect },
      ...prev,
    ]);

    setUserInput("");

    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex((prev) => prev + 1);
    } else {
      setIsLearningComplete(true);
    }
  };

  return {
    currentWordIndex,
    userInput,
    setUserInput,
    wordAttempts,
    isLearningComplete,
    words,
    handleSubmit,
  };
};

export const LearningPage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const unit = location.state?.unit as Unit;

  const {
    currentWordIndex,
    userInput,
    setUserInput,
    wordAttempts,
    isLearningComplete,
    words,
    handleSubmit,
  } = useLearningState(unit);

  if (!unit) return null;

  return (
    <div className="flex flex-col min-h-screen p-4 font-sans text-tg-text-color">
      <h1 className="text-xl font-bold mb-6 text-tg-section-header-text-color animate-fade-in">
        {unit.name}
      </h1>

      {!isLearningComplete && (
        <>
          <WordPrompt
            word={words[currentWordIndex][1]}
            userInput={userInput}
            setUserInput={setUserInput}
            onSubmit={handleSubmit}
          />
          {currentWordIndex < words.length && (
            <p className="mt-1 mb-4 text-sm text-tg-hint-color animate-fade-in">
              {words.length - currentWordIndex === 1
                ? t("lastWord")
                : `${t("wordsLeft")}: ${words.length - currentWordIndex}`}
            </p>
          )}
        </>
      )}

      <LearningProgress attempts={wordAttempts} />

      {isLearningComplete && (
        <CompletionMessage
          correctCount={wordAttempts.filter((a) => a.isCorrect).length}
          totalCount={words.length}
        />
      )}
    </div>
  );
};
