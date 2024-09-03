import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Input } from "@telegram-apps/telegram-ui";
import { FaCheckSquare } from "react-icons/fa";
import { useHapticFeedback, useMainButton } from "@telegram-apps/sdk-react";
import { useTranslation } from "react-i18next";

export const IndexPage: React.FC = () => {
  const haptic = useHapticFeedback();
  const mainButton = useMainButton();
  const { t } = useTranslation();

  const [problem, setProblem] = useState("");
  const navigate = useNavigate();

  const problemInfo = useParams<{ formula: string }>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the problem to a backend
    // For now, we'll just log it
    console.log("Problem submitted:", problem);
    setProblem("");
  };

  useEffect(() => {
    mainButton.show();
    mainButton.enable();
    mainButton.setText(t("historyTitle"));
    mainButton.on("click", () => {
      haptic.impactOccurred("medium");
      navigate("/history");
      mainButton.hide();
    });

    console.log(problemInfo);
  }, [mainButton]);

  return (
    <div className="p-4 flex flex-col h-screen">
      <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
        <Input
          className="mb-4"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Enter your math problem"
        />
        <Button
          type="submit"
          className="mb-4"
          onClick={() => {
            haptic.impactOccurred("heavy");
          }}
        >
          <div className="flex gap-1 items-center">
            <FaCheckSquare size={20} />
            {t("sumbitButton")}
          </div>
        </Button>
      </form>
      <button onClick={() => navigate("/history")}>dev history</button>
    </div>
  );
};
