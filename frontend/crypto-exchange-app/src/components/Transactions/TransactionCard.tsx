import React from "react";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { IoShareOutline } from "react-icons/io5";
import { Transaction } from "@/utils/responseTypes";
import { formatNumber } from "@/utils/numberFormatting";
import { InfoItem } from "../other/InfoItem";

interface TransactionCardProps {
  transaction: Transaction;
  onSell: (id: number) => void;
  onShare: () => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onSell,
  onShare,
}) => {
  const isOpen = !transaction.close_date;
  const profitValue = isOpen
    ? transaction.estimated_profit
    : transaction.profit;
  const sellPrice = isOpen
    ? transaction.estimated_sell_price
    : transaction.sell_price;

  const formatDate = (dateString: string | null) =>
    dateString ? new Date(dateString).toLocaleString() : "—";

  const getProfitColor = (value: number | null) =>
    isOpen
      ? "text-yellow-500"
      : value && value >= 0
      ? "text-green-500"
      : "text-red-500";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">{transaction.coin_symbol}</h3>
        <span
          className={`text-lg font-semibold ${getProfitColor(profitValue)}`}
        >
          {isOpen ? "Est. " : ""}
          {formatNumber(profitValue ?? 0, true, 2)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <InfoItem
          label="Amount"
          value={formatNumber(transaction.amount, false, 8)}
        />
        <InfoItem label="Points" value={transaction.points_spent} />
        <InfoItem
          label="Buy"
          value={formatNumber(transaction.buy_price, true, 4)}
        />
        <InfoItem
          label="Sell"
          value={`${isOpen ? "Est. " : ""}${formatNumber(
            sellPrice ?? 0,
            true,
            4
          )}`}
        />
        <InfoItem label="Opened" value={formatDate(transaction.open_date)} />
        {!isOpen && (
          <InfoItem label="Closed" value={formatDate(transaction.close_date)} />
        )}
      </div>
      <div className="flex justify-end space-x-3">
        {isOpen && (
          <ActionButton
            onClick={() => onSell(transaction.id)}
            icon={FaMoneyBillTransfer}
            text="Sell"
            bgColor="bg-blue-500"
          />
        )}
        <ActionButton
          onClick={onShare}
          icon={IoShareOutline}
          text="Share"
          bgColor="bg-sky-500"
        />
      </div>
    </div>
  );
};

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ElementType;
  text: string;
  bgColor: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  icon: Icon,
  text,
  bgColor,
}) => (
  <button
    onClick={onClick}
    className={`${bgColor} text-white font-bold py-2 px-4 rounded flex items-center transition-colors duration-300 hover:opacity-80`}
  >
    <Icon size={18} className="mr-2" />
    {text}
  </button>
);
