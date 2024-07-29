import React from "react";

interface WinMessageProps {
  spinStatus: string;
  spinAction: string;
  winAmount: number;
}

const WinMessage: React.FC<WinMessageProps> = ({
  spinStatus,
  spinAction,
  winAmount,
}) => {
  let message: string;
  let textColor: string;

  switch (spinStatus) {
    case "initial":
      message = "Press Spin Button!";
      textColor = "text-white";
      break;
    case "spinning":
      message = "Spinning...";
      textColor = "text-yellow-500";
      break;
    case "complete":
      if (spinAction === "win") {
        message = `You won: ${winAmount}`;
        textColor = "text-green-500";
      } else if (spinAction === "lose") {
        message = "Try again";
        textColor = "text-red-500";
      } else {
        message = "Spin complete";
        textColor = "text-white";
      }
      break;
    case "limit":
      message = "Try after some time";
      textColor = "text-white";
      break;
    default:
      message = "err";
      textColor = "text-white";
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 mb-3 flex justify-center w-64">
      <p className={`text-2xl font-bold ${textColor}`}>{message}</p>
    </div>
  );
};

export default WinMessage;
