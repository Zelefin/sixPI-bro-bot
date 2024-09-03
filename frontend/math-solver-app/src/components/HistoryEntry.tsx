import React from "react";
import { Latex } from "./Latex";

interface HistoryEntryProps {
  formula: string;
  date: Date;
  onClick: () => void;
}

export const HistoryEntry: React.FC<HistoryEntryProps> = ({
  formula,
  date,
  onClick,
}) => {
  // Format the date to display date, hours, minutes, and seconds
  const formattedDate = date.toLocaleString("uk-UA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <div
      onClick={onClick}
      className="py-2 px-3 border-b border-section-separator-color flex items-center justify-between"
    >
      <div className="flex-shrink overflow-hidden">
        <Latex formula={formula} />
      </div>
      <p className="text-xs text-tg-hint-color whitespace-nowrap flex-shrink-0">
        {formattedDate}
      </p>
    </div>
  );
};
