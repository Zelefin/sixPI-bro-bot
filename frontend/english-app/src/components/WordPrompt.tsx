import React from "react";
import { useTranslation } from "react-i18next";
import InputField from "./InputField";

export const WordPrompt: React.FC<{
  word: string;
  userInput: string;
  setUserInput: (input: string) => void;
  onSubmit: () => void;
}> = ({ word, userInput, setUserInput, onSubmit }) => {
  const { t } = useTranslation();
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, [word]);

  return (
    <div className="animate-fade-in">
      <p className="text-lg font-semibold mb-2 text-tg-subtitle-text-color">
        {t("translateWord")}:
      </p>
      <p className="text-2xl font-bold mb-4 text-tg-accent-text-color text-center">
        {word}
      </p>
      <InputField
        value={userInput}
        onChange={setUserInput}
        onSubmit={onSubmit}
        placeholder={t("typeEnglishTranslation")}
      />
    </div>
  );
};
