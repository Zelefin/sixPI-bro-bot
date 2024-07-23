import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  LargeTitle,
  List,
  Section,
  Select,
} from "@telegram-apps/telegram-ui";
import { initHapticFeedback } from "@telegram-apps/sdk";
import { GoPlusCircle } from "react-icons/go";
import { initPopup } from "@telegram-apps/sdk-react";

export const CreateTable: React.FC = () => {
  const navigate = useNavigate();
  const hapticFeedback = initHapticFeedback();
  const popup = initPopup();
  const [blindsMessage, setBlindsMessage] = useState("1/2 blinds");
  const [tableName, setTableName] = useState("");
  const [tableNameStatus, setTableNameStatus] = useState<"default" | "error">(
    "default"
  );
  const [selectedBuyIn, setSelectedBuyIn] = useState("10/30");
  const [selectedPlayers, setSelectedPlayers] = useState("2");

  const handleBuyInSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = event.target.value;
    setSelectedBuyIn(selectedOption);

    const buyInOptions: { [key: string]: number } = {
      "10/30": 10,
      "50/100": 50,
      "100/200": 100,
    };

    const minBuyIn = buyInOptions[selectedOption];
    const smallBlind = Math.round(minBuyIn * 0.1);
    const bigBlind = smallBlind * 2;

    setBlindsMessage(`${smallBlind}/${bigBlind} blinds`);
  };

  const handleCreateTable = async () => {
    if (tableName.trim() === "") {
      setTableNameStatus("error");
      hapticFeedback.notificationOccurred("error");
      popup.open({
        title: "Table name cannot be empty!",
        message: "Please enter a valid table name.",
        buttons: [{ id: "my-id", type: "close" }],
      });
      return;
    }

    const [minBuyIn, maxBuyIn] = selectedBuyIn.split("/").map(Number);
    const maxPlayers = Number(selectedPlayers);

    try {
      const response = await fetch("/poker/api/create_table", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: tableName,
          minBuyIn,
          maxBuyIn,
          maxPlayers,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create table");
      }

      const newTable = await response.json();
      navigate(`/table/${newTable.id}`);
    } catch (error) {
      console.error("Error creating table:", error);
      hapticFeedback.notificationOccurred("error");
    }
  };

  return (
    <>
      <LargeTitle className="text-center text-text-color mb-2">
        Create Table
      </LargeTitle>
      <List>
        <Section
          header="Table Information"
          footer="Additional information about table."
        >
          <Input
            header="Name"
            status={tableNameStatus}
            placeholder="Super Poker table"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          />
        </Section>
        <Section
          header="Table Settings"
          footer="Set Buy-ins to automatically calculate blinds (Small blind: 10% of minimum buy-in, Big blind: Small blind * 2)."
        >
          <Select
            header="Buy-ins"
            value={selectedBuyIn}
            onChange={handleBuyInSelect}
          >
            <option value="10/30">10/30 chips</option>
            <option value="50/100">50/100 chips</option>
            <option value="100/200">100/200 chips</option>
          </Select>
          <Input
            disabled={true}
            header="Small/Big Blinds"
            placeholder={blindsMessage}
          ></Input>
          <Select
            header="Players"
            value={selectedPlayers}
            onChange={(e) => setSelectedPlayers(e.target.value)}
          >
            {Array.from({ length: 11 }, (_, i) => (
              <option key={i + 2} value={(i + 2).toString()}>
                {i + 2}
              </option>
            ))}
          </Select>
        </Section>
        <div className="text-center mt-5 mb-5">
          <Button
            before={<GoPlusCircle size={24} />}
            className="bg-green-600"
            onClick={handleCreateTable}
          >
            Create table
          </Button>
        </div>
      </List>
    </>
  );
};
