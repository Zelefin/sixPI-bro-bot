import React, { useState } from "react";
import { FullScreenSticker } from "./FullScreenSticker";
import profitSticker from "@/stickers/profit.json";
import lossSticker from "@/stickers/loss.json";
import { useHapticFeedback, useUtils } from "@telegram-apps/sdk-react";
import { IoShareOutline } from "react-icons/io5";
import { FaMoneyBillTransfer } from "react-icons/fa6";

interface Transaction {
  id: number;
  crypto: string;
  amount: number;
  points_spent: number;
  buy_price: number;
  sell_price: number | null;
  profit: number | null;
  open_date: string;
  close_date: string | null;
  estimated_sell_price: number;
  estimated_profit: number;
}

const mockTransactions: Transaction[] = [
  {
    id: 1,
    crypto: "BTC",
    amount: 0.1,
    points_spent: 5000,
    buy_price: 50000,
    sell_price: null,
    profit: null,
    open_date: "2023-08-15T10:30:00",
    close_date: null,
    estimated_sell_price: 52000,
    estimated_profit: 200,
  },
  {
    id: 2,
    crypto: "ETH",
    amount: 2,
    points_spent: 6000,
    buy_price: 3000,
    sell_price: 3200,
    profit: 400,
    open_date: "2023-08-14T15:45:00",
    close_date: "2023-08-15T09:15:00",
    estimated_sell_price: 3200,
    estimated_profit: 400,
  },
  {
    id: 3,
    crypto: "ADA",
    amount: 1000,
    points_spent: 1500,
    buy_price: 1.5,
    sell_price: null,
    profit: null,
    open_date: "2023-08-13T08:20:00",
    close_date: null,
    estimated_sell_price: 1.4,
    estimated_profit: -100,
  },
  {
    id: 4,
    crypto: "DOGE",
    amount: 5000,
    points_spent: 1500,
    buy_price: 0.3,
    sell_price: 0.35,
    profit: 250,
    open_date: "2023-08-12T14:10:00",
    close_date: "2023-08-14T11:30:00",
    estimated_sell_price: 0.35,
    estimated_profit: 250,
  },
];

const TransactionRow: React.FC<{
  transaction: Transaction;
  onSell: (id: number) => void;
  onShare: (id: number) => void;
}> = ({ transaction, onSell, onShare }) => {
  const isOpen = !transaction.close_date;
  const profitValue = isOpen
    ? transaction.estimated_profit
    : transaction.profit!;
  const sellPrice = isOpen
    ? transaction.estimated_sell_price
    : transaction.sell_price!;

  // Function to format date strings
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString();
  };

  return (
    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
      <td className="px-6 py-4 font-medium">{transaction.crypto}</td>
      <td className="px-6 py-4">{transaction.amount}</td>
      <td className="px-6 py-4">{transaction.points_spent}</td>
      <td className="px-6 py-4">${transaction.buy_price.toFixed(2)}</td>
      <td className="px-6 py-4">
        {isOpen ? (
          <span className="text-yellow-500">Est. ${sellPrice.toFixed(2)}</span>
        ) : (
          `$${sellPrice.toFixed(2)}`
        )}
      </td>
      <td
        className={`px-6 py-4 ${
          isOpen
            ? "text-yellow-500"
            : profitValue >= 0
            ? "text-green-500"
            : "text-red-500"
        }`}
      >
        {isOpen
          ? `Est. $${profitValue.toFixed(2)}`
          : `$${profitValue.toFixed(2)}`}
      </td>
      <td className="px-6 py-4">{formatDate(transaction.open_date)}</td>
      <td className="px-6 py-4">{formatDate(transaction.close_date)}</td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          {isOpen && (
            <button
              onClick={() => onSell(transaction.id)}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <FaMoneyBillTransfer size={18} className="mr-2" />
              Sell
            </button>
          )}
          <button
            onClick={() => onShare(transaction.id)}
            className="bg-sky-500 text-white font-bold py-2 px-4 rounded flex items-center"
          >
            <IoShareOutline size={18} className="mr-2" />
            Share
          </button>
        </div>
      </td>
    </tr>
  );
};

export const TransactionsContent: React.FC = () => {
  const hapticFeedback = useHapticFeedback();
  const utils = useUtils();
  const [showSticker, setShowSticker] = useState(false);
  const [currentSticker, setCurrentSticker] = useState<any>(null);

  // Function to handle selling (closing) a transaction
  const handleSell = (transactionId: number) => {
    console.log(`Selling transaction with ID: ${transactionId}`);

    // Find the transaction
    const transaction = mockTransactions.find((t) => t.id === transactionId);

    if (transaction) {
      // Determine if it's a profit or loss
      const isProfit = transaction.estimated_profit > 0;
      setCurrentSticker(isProfit ? profitSticker : lossSticker);
      setShowSticker(true);
    }

    // For now, we'll just simulate it with a console log
    hapticFeedback.notificationOccurred("success");
    console.log(`Transaction ${transactionId} sold`);
  };

  const handleShare = (transactionId: number) => {
    const transaction = mockTransactions.find((t) => t.id === transactionId);
    if (transaction) {
      const messageToShare = `
🚀 **Transaction #${transaction.id}** 🚀

🪙 ${transaction.crypto} | ${transaction.amount}
💰 ${transaction.points_spent} points spent 
📥 Buy: $${transaction.buy_price.toFixed(2)} | 📤 Sell: ${
        transaction.sell_price
          ? `$${transaction.sell_price.toFixed(2)}`
          : `__Est.__ $${transaction.estimated_sell_price.toFixed(2)}`
      }
✨ Profit: ${
        transaction.profit !== null
          ? `${transaction.profit >= 0 ? "🟢" : "🔴"}$${Math.abs(
              transaction.profit
            ).toFixed(2)}`
          : `__Est.__ ${
              transaction.estimated_profit >= 0 ? "🟢" : "🔴"
            }$${Math.abs(transaction.estimated_profit).toFixed(2)}`
      }
🗓️ Opened on ${new Date(transaction.open_date).toLocaleString()}
🔒 Closed on ${
        transaction.close_date
          ? new Date(transaction.close_date).toLocaleString()
          : "—"
      }
`;

      utils.shareURL("", messageToShare);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="text-2xl font-bold mb-4 top-0 py-2">
        Recent Transactions
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Crypto
              </th>
              <th scope="col" className="px-6 py-3">
                Amount
              </th>
              <th scope="col" className="px-6 py-3">
                Points Spent
              </th>
              <th scope="col" className="px-6 py-3">
                Buy Price
              </th>
              <th scope="col" className="px-6 py-3">
                Sell Price
              </th>
              <th scope="col" className="px-6 py-3">
                Profit
              </th>
              <th scope="col" className="px-6 py-3">
                Open Date
              </th>
              <th scope="col" className="px-6 py-3">
                Close Date
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {mockTransactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                onSell={handleSell}
                onShare={handleShare}
              />
            ))}
          </tbody>
        </table>
      </div>
      {showSticker && (
        <FullScreenSticker
          stickerSrc={currentSticker}
          onClose={() => setShowSticker(false)}
        />
      )}
    </div>
  );
};
