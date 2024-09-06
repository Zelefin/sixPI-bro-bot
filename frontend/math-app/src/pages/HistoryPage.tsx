import React from "react";
import { useNavigate } from "react-router-dom";
import { RiHistoryFill } from "react-icons/ri";
import { HistoryEntry } from "../components/HistoryEntry";
import { useTranslation } from "react-i18next";

const mockHistory = [
  {
    id: 1,
    formula: "\\sum_{n=1}^{\\infty} (-1)^n \\frac{n}{12^n}",
    date: new Date("2023-08-26T18:03:59"),
  },
  {
    id: 2,
    formula: "\\int_{0}^{\\pi} \\sin(x) dx",
    date: new Date("2023-08-27T09:15:45"),
  },
  {
    id: 3,
    formula: "\\lim_{x \\to 0} \\frac{\\sin(x)}{x}",
    date: new Date("2023-08-28T14:32:21"),
  },
];

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="p-2">
      <div className="flex items-center mb-3 gap-1">
        <RiHistoryFill size={20} />
        <h2 className="text-lg font-bold">{t("historyTitle")}</h2>
      </div>
      <div>
        {mockHistory.map((entry) => (
          <HistoryEntry
            key={entry.id}
            formula={entry.formula}
            date={entry.date}
            onClick={() => navigate(`/problem/${entry.id}`)}
          />
        ))}
      </div>
    </div>
  );
};
