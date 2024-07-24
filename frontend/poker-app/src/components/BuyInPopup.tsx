import React, { useState } from "react";
import { Button } from "@telegram-apps/telegram-ui";
import { initHapticFeedback, initPopup } from "@telegram-apps/sdk-react";

interface BuyInPopupProps {
  minBuyIn: number;
  maxBuyIn: number;
  onSubmit: (amount: number) => void;
  onCancel: () => void;
}

export const BuyInPopup: React.FC<BuyInPopupProps> = ({
  minBuyIn,
  maxBuyIn,
  onSubmit,
  onCancel,
}) => {
  const hapticFeedback = initHapticFeedback();
  const popup = initPopup();

  const [buyIn, setBuyIn] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const amount = Number(buyIn);
    if (amount >= minBuyIn && amount <= maxBuyIn) {
      onSubmit(amount);
    } else {
      hapticFeedback.notificationOccurred("error");
      popup.open({
        title: "Wrong buy-in!",
        message: "Please enter a valid buy-in.",
        buttons: [{ id: "my-id", type: "ok" }],
      });
      setError(`Please enter an amount between ${minBuyIn} and ${maxBuyIn}`);
      setBuyIn("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBuyIn(e.target.value);
    setError("");
  };

  const setMinBuyIn = () => {
    setBuyIn(minBuyIn.toString());
    setError("");
  };

  const setMaxBuyIn = () => {
    setBuyIn(maxBuyIn.toString());
    setError("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-section-bg-color p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Enter your buy-in</h2>
        <p className="mb-4">
          Please enter an amount between {minBuyIn} and {maxBuyIn}
        </p>
        <div className="flex items-center mb-4">
          <input
            type="number"
            value={buyIn}
            onChange={handleInputChange}
            placeholder="Enter buy-in amount"
            className="flex-grow p-2 border rounded-md bg-secondary-bg-color"
          />
          <div className="flex ml-2">
            <Button
              onClick={setMinBuyIn}
              className="rounded-md px-2 py-1 text-xs md:text-sm mr-1"
            >
              MIN
            </Button>
            <Button
              onClick={setMaxBuyIn}
              className="rounded-md px-2 py-1 text-xs md:text-sm"
            >
              MAX
            </Button>
          </div>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex justify-end space-x-2">
          <Button onClick={onCancel} className="bg-red-500 text-white">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-green-500 text-white">
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};
