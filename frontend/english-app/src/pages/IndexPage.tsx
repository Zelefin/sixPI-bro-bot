import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Unit } from "../types";
import { units } from "../units";
import { useHapticFeedback, useMainButton } from "@telegram-apps/sdk-react";

export const IndexPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const haptic = useHapticFeedback();
  const mainButton = useMainButton();
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [mixWords, setMixWords] = useState(false);
  const [mixedWords, setMixedWords] = useState<Record<string, string> | null>(
    null
  );

  const handleUnitSelect = (unit: Unit) => {
    haptic.impactOccurred("light");
    setSelectedUnit(unit);
    setMixedWords(null); // Reset mixed words when a new unit is selected
  };

  const toggleMixWords = useCallback(() => {
    haptic.impactOccurred("soft");
    setMixWords((prev) => {
      if (!prev) {
        // If turning on mix words, generate the mixed words
        setMixedWords(selectedUnit ? getMixedWords(selectedUnit.words) : null);
      } else {
        // If turning off mix words, reset mixed words
        setMixedWords(null);
      }
      return !prev;
    });
  }, [selectedUnit]);

  const getMixedWords = useCallback((words: Record<string, string>) => {
    const entries = Object.entries(words);
    const shuffled = [...entries].sort(() => Math.random() - 0.5);
    return Object.fromEntries(shuffled);
  }, []);

  const displayedWords = useMemo(() => {
    if (mixWords && mixedWords) {
      return mixedWords;
    }
    return selectedUnit?.words || {};
  }, [mixWords, mixedWords, selectedUnit]);

  const startLearning = () => {
    if (selectedUnit) {
      haptic.impactOccurred("heavy");
      mainButton.hide();
      navigate("/learn", {
        state: { unit: { ...selectedUnit, words: displayedWords } },
      });
    } else {
      alert(t("pleaseSelectUnit"));
    }
  };

  React.useEffect(() => {
    if (selectedUnit) {
      mainButton.show();
      mainButton.enable();
      mainButton.setText(t("start"));
      mainButton.on("click", startLearning);
    } else {
      mainButton.hide();
    }

    return () => {
      mainButton.off("click", startLearning);
    };
  }, [mainButton, selectedUnit, startLearning, t]);

  return (
    <div className="p-4 min-h-screen text-tg-text-color">
      <h1 className="text-xl font-bold mb-6 animate-fade-in">
        {t("selectUnit")}
      </h1>
      <div className="grid grid-cols-1 gap-3 mb-6">
        {units.map((unit) => (
          <button
            key={unit.id}
            className={`p-3 rounded-lg shadow-md transition-all duration-300 animate-slide-in ${
              selectedUnit?.id === unit.id
                ? "bg-tg-button-color text-white"
                : "bg-tg-section-bg-color text-tg-text-color border border-tg-section-separator-color"
            }`}
            onClick={() => handleUnitSelect(unit)}
          >
            {unit.name}
          </button>
        ))}
      </div>
      {selectedUnit && (
        <>
          <div className="mb-4 flex items-center justify-between bg-tg-section-bg-color p-3 rounded-lg shadow-md transition-all duration-300 animate-fade-in">
            <label
              htmlFor="mixWords"
              className="flex items-center cursor-pointer"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  id="mixWords"
                  checked={mixWords}
                  onChange={toggleMixWords}
                  className="sr-only"
                />
                <div
                  className={`w-10 h-6 bg-gray-400 rounded-full shadow-inner transition-colors duration-300 ease-in-out ${
                    mixWords ? "bg-tg-button-color" : ""
                  }`}
                ></div>
                <div
                  className={`absolute w-4 h-4 bg-white rounded-full shadow inset-y-1 left-1 transition-transform duration-300 ease-in-out ${
                    mixWords ? "transform translate-x-full" : ""
                  }`}
                ></div>
              </div>
              <span className="ml-3 text-tg-text-color font-medium">
                {t("mixWords")}
              </span>
            </label>
          </div>
          <div className="mb-6 bg-tg-section-bg-color p-4 rounded-lg shadow-md animate-bounce-in border border-tg-section-separator-color">
            <h2 className="text-xl font-semibold mb-3">{t("wordsInUnit")}:</h2>
            <ul className="list-disc list-inside text-tg-text-color">
              {Object.entries(displayedWords).map(([english, ukrainian]) => (
                <li key={english} className="mb-1">
                  {english} - {ukrainian}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
      <button className="" onClick={startLearning} disabled={!selectedUnit}>
        {t("start")} dev
      </button>
    </div>
  );
};
