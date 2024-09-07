import React, { useState } from "react";
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

  const handleUnitSelect = (unit: Unit) => {
    haptic.impactOccurred("light");
    setSelectedUnit(unit);
  };

  const startLearning = () => {
    if (selectedUnit) {
      haptic.impactOccurred("heavy");
      mainButton.hide();
      navigate("/learn", { state: { unit: selectedUnit } });
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
        <div className="mb-6 bg-tg-section-bg-color p-4 rounded-lg shadow-md animate-bounce-in border border-tg-section-separator-color">
          <h2 className="text-xl font-semibold mb-3">{t("wordsInUnit")}:</h2>
          <ul className="list-disc list-inside text-tg-text-color">
            {Object.entries(selectedUnit.words).map(([english, ukrainian]) => (
              <li key={english} className="mb-1">
                {english} - {ukrainian}
              </li>
            ))}
          </ul>
        </div>
      )}
      <button className="" onClick={startLearning} disabled={!selectedUnit}>
        {t("start")} dev
      </button>
    </div>
  );
};
