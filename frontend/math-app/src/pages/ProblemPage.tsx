import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
import { MathProblemDisplay } from "../components/MathProblemDisplay";
import { mockedProblemData } from "../components/problemTypes";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useHapticFeedback, useMainButton } from "@telegram-apps/sdk-react";

export const ProblemPage: React.FC = () => {
  // const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const mainButton = useMainButton();
  const haptic = useHapticFeedback();
  const [isContextExpanded, setIsContextExpanded] = useState(false);

  // For now, we're using mock data. In a real application, you'd fetch this data based on the id.
  const problem = mockedProblemData;

  useEffect(() => {
    if (isContextExpanded) {
      mainButton.show();
      mainButton.enable();
      mainButton.setText(t("edit"));
      mainButton.on("click", () => {
        haptic.impactOccurred("medium");
        navigate(`/edit/${problem.problem.id}`);
      });
    } else {
      mainButton.hide();
    }
  }, [isContextExpanded]);

  return (
    <div>
      <div className="mb-4 overflow-hidden">
        <button
          className="w-full p-3 bg-tg-section-bg-color flex justify-between items-center"
          onClick={() => setIsContextExpanded(!isContextExpanded)}
        >
          <span className="font-bold">{t("context")}</span>
          {isContextExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {isContextExpanded && (
          <div>
            <div className="p-3">
              <h3 className="font-semibold mb-2">{t("problem")}:</h3>
              <div className="mb-3 overflow-auto">
                {problem.problem_formula}
              </div>
              <h3 className="font-semibold mb-2">{t("additionalInfo")}:</h3>
              {problem.additional_info ? problem.additional_info : "-"}
            </div>
            <button
              onClick={() => {
                navigate("/edit");
              }}
            >
              dev edit
            </button>
          </div>
        )}
        <hr className="border-t border-tg-section-separator-color" />
      </div>

      <MathProblemDisplay problem={problem.problem} />
    </div>
  );
};
