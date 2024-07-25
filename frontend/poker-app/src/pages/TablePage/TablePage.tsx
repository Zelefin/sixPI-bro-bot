import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  initClosingBehavior,
  retrieveLaunchParams,
} from "@telegram-apps/sdk-react";
import { LargeTitle, Spinner } from "@telegram-apps/telegram-ui";
import { BuyInPopup } from "@/components/BuyInPopup";

export const TablePage: React.FC = () => {
  const { initData } = retrieveLaunchParams();
  const [closingBehavior] = initClosingBehavior();
  closingBehavior.enableConfirmation();

  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [tableDetails, setTableDetails] = useState<any>(null);
  const [showBuyInPopup, setShowBuyInPopup] = useState(true);

  const [balance, setBalance] = useState(0);

  // Fetch table details
  useEffect(() => {
    const fetchTableDetails = async () => {
      try {
        const response = await fetch(`/poker/api/tables/${tableId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch table details");
        }
        const data = await response.json();
        setTableDetails(data);
      } catch (error) {
        console.error("Error fetching table details:", error);
      }
    };

    fetchTableDetails();
  }, [tableId]);

  const fetchBalance = async () => {
    const userId = initData?.user?.id;
    const balanceResponse = await fetch(`/get_balance?user_id=${userId}`);
    const balance = await balanceResponse.json();
    setBalance(balance.balance);
  };

  // Handle buy-in submission
  const handleBuyInSubmit = (amount: number) => {
    console.log(`Buy-in submitted: ${amount}`);
    setShowBuyInPopup(false);
    // Here you would typically send the buy-in amount to your backend
  };

  // Handle buy-in cancellation
  const handleBuyInCancel = () => {
    navigate("/");
  };

  // Set a timeout to navigate back if the user doesn't interact
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (showBuyInPopup) {
        navigate("/");
      }
    }, 30000);

    return () => clearTimeout(timeoutId);
  }, [showBuyInPopup, navigate]);

  // WebSocket connection
  useEffect(() => {
    fetchBalance();

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const socket = new WebSocket(`${protocol}//${host}/poker/ws/${tableId}`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "player_count") {
        setPlayerCount(data.count);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      socket.close();
    };
  }, [tableId]);

  // Render loading state if table details are not yet loaded
  if (!tableDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="m" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <LargeTitle className="text-center text-blue-600 mb-4">
        Welcome to the table "{tableDetails.name}"
      </LargeTitle>
      <p className="text-center">
        Current players on this table: {playerCount}
      </p>
      <p className="text-center">
        Blinds: {tableDetails.smallBlind}/{tableDetails.bigBlind}
      </p>
      {showBuyInPopup && (
        <BuyInPopup
          balance={balance}
          minBuyIn={tableDetails.minBuyIn}
          maxBuyIn={tableDetails.maxBuyIn}
          onSubmit={handleBuyInSubmit}
          onCancel={handleBuyInCancel}
        />
      )}
      {!showBuyInPopup && (
        <div className="mt-4">
          {/* Add your table UI components here */}
          <p className="text-center">Table UI goes here</p>
        </div>
      )}
    </div>
  );
};
