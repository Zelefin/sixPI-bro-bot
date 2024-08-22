import React, { useState, useEffect } from "react";
import Loading from "../other/Loading";
import ErrorMsg from "../other/ErrorMsg";
import NoResults from "../other/NoResults";
import { LeaderboardEntry } from "./LeaderboardEntry";
import { Transaction } from "../../utils/responseTypes";

export const LeaderboardContent: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/crypto-exchange/top_transactions", {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.ok && Array.isArray(data.top_transactions)) {
          setTransactions(data.top_transactions);
        } else {
          throw new Error("Invalid data format received from server");
        }
      } catch (e) {
        console.error("Error fetching top transactions:", e);
        setError("Failed to fetch top transactions 🚫");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopTransactions();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return <Loading />;
    }
    if (error) {
      return <ErrorMsg message={error} />;
    }
    if (transactions.length === 0) {
      return <NoResults message="No transactions available yet... 🐣" />;
    }
    return (
      <div className="space-y-4 mb-24">
        {transactions.map((transaction, index) => (
          <LeaderboardEntry
            key={transaction.id}
            transaction={transaction}
            rank={index + 1}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col p-4">
      <h2 className="text-2xl font-bold mb-4">Top Transactions</h2>
      {renderContent()}
    </div>
  );
};
