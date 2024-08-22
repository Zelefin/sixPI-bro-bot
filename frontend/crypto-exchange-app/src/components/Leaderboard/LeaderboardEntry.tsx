import React from "react";
import { formatNumber } from "@/utils/numberFormatting";
import { Transaction } from "@/utils/responseTypes";
import { InfoItem } from "../other/InfoItem";

export const LeaderboardEntry: React.FC<{
  transaction: Transaction;
  rank: number;
}> = ({ transaction, rank }) => {
  const profitValue = transaction.profit;

  // Function to format date strings
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString();
  };

  const styleRank = (rank: number) => {
    if (rank === 1) {
      return "animate-gradient-x bg-gradient-to-r from-yellow-400 via-yellow-100 to-yellow-400 bg-300% bg-clip-text text-transparent";
    } else if (rank === 2) {
      return "animate-gradient-x bg-gradient-to-r from-gray-400 via-gray-100 to-gray-400 bg-300% bg-clip-text text-transparent";
    } else if (rank === 3) {
      return "animate-gradient-x bg-gradient-to-r from-yellow-600 via-orange-200 to-yellow-600 bg-300% bg-clip-text text-transparent";
    } else {
      return "text-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6 mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <span className={`${styleRank(rank)} text-3xl font-bold mr-3`}>
            #{rank}
          </span>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {transaction.full_name}
          </h3>
        </div>
        <span className="text-lg font-semibold text-green-500 dark:text-green-400">
          {formatNumber(profitValue ?? 0, true, 2)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InfoItem label="Crypto" value={transaction.coin_symbol} />
        <InfoItem
          label="Amount"
          value={formatNumber(transaction.amount, false, 8)}
        />
        <InfoItem label="Opened" value={formatDate(transaction.open_date)} />
        <InfoItem label="Closed" value={formatDate(transaction.close_date)} />
      </div>
    </div>
  );
};
