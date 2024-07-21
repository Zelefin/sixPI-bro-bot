import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { initClosingBehavior } from "@telegram-apps/sdk-react";
import { LargeTitle } from "@telegram-apps/telegram-ui";

export const TablePage: React.FC = () => {
  const [closingBehavior] = initClosingBehavior();
  closingBehavior.enableConfirmation();

  const { tableId } = useParams<{ tableId: string }>();
  const [playerCount, setPlayerCount] = useState<number>(0);

  useEffect(() => {
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

  return (
    <div className="p-4">
      <LargeTitle className="text-center text-blue-600 mb-4">
        Welcome to the table {tableId}
      </LargeTitle>
      <p className="text-center">
        Current players on this table: {playerCount}
      </p>
    </div>
  );
};
