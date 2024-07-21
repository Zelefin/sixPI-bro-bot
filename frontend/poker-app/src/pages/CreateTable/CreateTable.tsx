import { initClosingBehavior } from "@telegram-apps/sdk-react";
import { BsFillInfoCircleFill } from "react-icons/bs";
import {
  Button,
  Input,
  LargeTitle,
  List,
  Section,
  Select,
  Snackbar,
} from "@telegram-apps/telegram-ui";
import type { FC } from "react";
import { useState } from "react";
import { GoPlusCircle } from "react-icons/go";

export const CreateTable: FC = () => {
  const [closingBehavior] = initClosingBehavior();
  closingBehavior.enableConfirmation();

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snakbarDescription, setSnackbarDescription] = useState("");
  const [tableName, setTableName] = useState("");
  const [tableNameStatus, setTableNameStatus] = useState<"default" | "error">(
    "default"
  );

  const handleCreateTable = () => {
    if (tableName.trim() === "") {
      setTableNameStatus("error");
      setSnackbarMessage("Table name cannot be empty");
      setSnackbarDescription("Please enter a valid table name");
      setShowSnackbar(true);
    } else {
      setTableNameStatus("default");
      // Add your logic here for creating the table
      console.log("Table created with name:", tableName);
    }
  };

  const handleBuyInSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    console.log("here");
    const selectedOption = event.target.value;

    const buyInOptions = {
      "10/30 chips": 10,
      "50/100 chips": 50,
      "100/200 chips": 100,
    };

    const minBuyIn = buyInOptions[selectedOption as keyof typeof buyInOptions];
    const smallBlind = Math.round(minBuyIn * 0.1);
    const bigBlind = smallBlind * 2;

    const message = `Small Blind: ${smallBlind}, Big Blind: ${bigBlind}`;
    setSnackbarMessage(message);
    setSnackbarDescription(
      "Blinds are calculated automatically based on the selected buy-in."
    );
    setShowSnackbar(true);
  };

  return (
    <>
      <LargeTitle className="text-center text-blue-600 mb-2">
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
          <Select header="Buy-ins" onChange={handleBuyInSelect}>
            <option>10/30 chips</option>
            <option>50/100 chips</option>
            <option>100/200 chips</option>
          </Select>
          <Select header="Players">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={(i + 1).toString()}>
                {i + 1}
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
      {showSnackbar && (
        <Snackbar
          onClose={() => setShowSnackbar(false)}
          before={<BsFillInfoCircleFill size={20} />}
          description={snakbarDescription}
          duration={5000}
        >
          {snackbarMessage}
        </Snackbar>
      )}
    </>
  );
};
