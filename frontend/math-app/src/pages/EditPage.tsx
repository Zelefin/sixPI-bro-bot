import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@telegram-apps/telegram-ui";
import { FaCheckSquare } from "react-icons/fa";
import { useHapticFeedback } from "@telegram-apps/sdk-react";
import { useTranslation } from "react-i18next";
import { mockedProblemData } from "../problemTypes";

export const EditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const haptic = useHapticFeedback();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [problem, setProblem] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");

  useEffect(() => {
    // In a real app, you'd fetch the problem data based on the id
    // For now, we'll use the mocked data
    setProblem(mockedProblemData.problem_formula);
    setAdditionalInfo(mockedProblemData.additional_info || "");
  }, [id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the updated problem to a backend
    console.log("Updated problem:", { problem, additionalInfo });
    haptic.impactOccurred("heavy");
    navigate(`/problem/${id}`);
  };

  return (
    <div className="p-4 flex flex-col h-screen">
      <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
        {/* <Input
          className="mb-4"
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder={t("enterMathProblem")}
          label={t("problem")}
        />
        <Input
          className="mb-4"
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          placeholder={t("enterAdditionalInfo")}
          label={t("additionalInfo")}
        /> */}
        <Button type="submit" className="mt-auto">
          <div className="flex gap-1 items-center justify-center">
            <FaCheckSquare size={20} />
            {t("updateProblem")}
          </div>
        </Button>
      </form>
    </div>
  );
};
