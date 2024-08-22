import React, { useState, useEffect } from "react";
import { FullScreenSticker } from "../other/FullScreenSticker";
import profitSticker from "@/stickers/profit.json";
import lossSticker from "@/stickers/loss.json";
import {
  useHapticFeedback,
  useUtils,
  useLaunchParams,
  usePopup,
} from "@telegram-apps/sdk-react";
import { Transaction, UserTransactions } from "@/utils/responseTypes";
import Loading from "../other/Loading";
import ErrorMsg from "../other/ErrorMsg";
import NoResults from "../other/NoResults";
import { TransactionCard } from "./TransactionCard";
import { shareTransaction } from "@/utils/shareTransaction";

interface TransactionsContentProps {
  setBalance: React.Dispatch<React.SetStateAction<number>>;
}

export const TransactionsContent: React.FC<TransactionsContentProps> = ({
  setBalance,
}) => {
  const hapticFeedback = useHapticFeedback();
  const utils = useUtils();
  const popup = usePopup();
  const { initDataRaw } = useLaunchParams();
  const [showSticker, setShowSticker] = useState(false);
  const [currentSticker, setCurrentSticker] = useState<any>(null);
  const [userTransactions, setUserTransactions] = useState<UserTransactions>({
    open_transactions: [],
    closed_transactions: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"open" | "closed">("open");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    const formData = new URLSearchParams({ _auth: initDataRaw || "" });
    try {
      const response = await fetch("/crypto-exchange/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.ok) {
        setUserTransactions({
          open_transactions: data.open_transactions,
          closed_transactions: data.closed_transactions,
        });
      } else {
        throw new Error("Invalid data format received from server");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSell = async (transactionId: number) => {
    try {
      const formData = new URLSearchParams();
      formData.append("_auth", initDataRaw || "");
      formData.append("transaction_id", transactionId.toString());

      const response = await fetch("/crypto-exchange/sell", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.ok) {
        hapticFeedback.notificationOccurred("success");
        const profit = parseFloat(data.profit);
        setCurrentSticker(profit >= 0 ? profitSticker : lossSticker);
        setShowSticker(true);
        if (data.new_balance !== undefined) {
          setBalance(data.new_balance);
        }
        fetchTransactions();
      } else {
        throw new Error(data.err || "Sale failed");
      }
    } catch (e) {
      hapticFeedback.notificationOccurred("error");
      popup.open({
        title: "Sale Failed",
        message: e instanceof Error ? e.message : "An unknown error occurred",
        buttons: [{ id: "ok", type: "ok" }],
      });
    }
  };

  const handleShare = (transaction: Transaction) => {
    const messageToShare = shareTransaction(transaction);
    utils.shareURL("", messageToShare);
  };

  const activeTransactions =
    activeTab === "open"
      ? userTransactions.open_transactions
      : userTransactions.closed_transactions;

  // Render content based on loading, error, and data states
  const renderContent = () => {
    if (isLoading) {
      return <Loading />;
    }
    if (error) {
      return <ErrorMsg message={error} />;
    }
    if (activeTransactions.length === 0) {
      return <NoResults message={`No ${activeTab} transactions yet... 🐣`} />;
    }
    return (
      <div className="space-y-4 mb-24">
        {activeTransactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            onSell={handleSell}
            onShare={() => handleShare(transaction)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-around mb-4 sticky top-0  z-10 shadow-md dark:shadow-gray-700">
        <button
          className={`py-2 px-4 font-bold ${
            activeTab === "open"
              ? "border-b-2 border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400"
              : "text-gray-500 dark:text-gray-400"
          }`}
          onClick={() => setActiveTab("open")}
        >
          Open
        </button>
        <button
          className={`py-2 px-4 font-bold ${
            activeTab === "closed"
              ? "border-b-2 border-blue-500 text-blue-500 dark:border-blue-400 dark:text-blue-400"
              : "text-gray-500 dark:text-gray-400"
          }`}
          onClick={() => setActiveTab("closed")}
        >
          Closed
        </button>
      </div>
      <div className="flex-grow overflow-y-auto p-4">{renderContent()}</div>
      {showSticker && (
        <FullScreenSticker
          stickerSrc={currentSticker}
          onClose={() => setShowSticker(false)}
        />
      )}
    </div>
  );
};
