import React from "react";
import { LuRefreshCcw } from "react-icons/lu";

interface SpinButtonProps {
  postSpin: () => void;
  isSpinDisabled: boolean;
  isSpinInProgress: boolean;
}

const SpinButton: React.FC<SpinButtonProps> = ({
  postSpin,
  isSpinDisabled,
  isSpinInProgress,
}) => {
  return (
    <div>
      <div className="flex items-center justify-center">
        <button
          onClick={postSpin}
          className={`
          px-8 py-3 text-2xl font-bold text-white 
          uppercase tracking-wider
          rounded-md
          transition-all duration-300 ease-in-out
          active:translate-y-1 active:shadow-inner
          ${
            isSpinDisabled
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-[0_4px_0_rgb(67,56,202)]"
          }
        `}
          disabled={isSpinDisabled}
        >
          <div className="flex items-center justify-center">
            <LuRefreshCcw
              className={`mr-2 ${
                isSpinInProgress ? "animate-spin-reverse" : ""
              }`}
            />
            <p>Spin</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default SpinButton;
