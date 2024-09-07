import React from "react";
import { useTranslation } from "react-i18next";
import { WordAttempt } from "../types";

export const LearningProgress: React.FC<{ attempts: WordAttempt[] }> = ({
  attempts,
}) => {
  const { t } = useTranslation();
  const [lastAttemptId, setLastAttemptId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (attempts.length > 0) {
      setLastAttemptId(`${attempts[0].ukrainian}-${attempts[0].english}`);
    }
  }, [attempts]);

  return (
    <div className="flex-grow">
      <h2 className="text-xl font-semibold mb-4 text-tg-section-header-text-color">
        {t("words")}:
      </h2>
      <div className="space-y-3">
        {attempts.map((attempt, _) => {
          const attemptId = `${attempt.ukrainian}-${attempt.english}`;
          return (
            <div
              key={attemptId}
              className={`p-3 rounded-lg shadow-md 
                  ${attemptId === lastAttemptId ? "animate-slide-in-top" : ""}
                  ${
                    attempt.isCorrect
                      ? "bg-green-100 dark:bg-green-800 border-green-500"
                      : "bg-red-100 dark:bg-red-800 border-red-500"
                  }
                  border-2`}
            >
              <p className="font-semibold text-tg-text-color">
                {attempt.ukrainian} - {attempt.english}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("yourAnswer")}: {attempt.userAnswer}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
