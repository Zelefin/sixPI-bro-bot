import React from "react";

interface StakeProps {
  stake: number;
  balance: number;
  setStake: React.Dispatch<React.SetStateAction<number>>;
  isSpinDisabled: boolean;
}

const Stake: React.FC<StakeProps> = ({
  stake,
  balance,
  setStake,
  isSpinDisabled,
}) => {
  const increaseStake = () => setStake((prev) => Math.min(prev + 1, 10));
  const decreaseStake = () => setStake((prev) => Math.max(prev - 1, 1));

  return (
    <div>
      <p className="text-2xl font-bold text-center">Stake</p>
      <div className="flex items-center justify-center">
        <div className="flex">
          <button
            onClick={decreaseStake}
            className="px-4 py-3 text-2xl font-bold bg-red-500 text-white rounded-l
                    transition duration-150 ease-in-out
                    hover:bg-red-600 active:bg-red-700 active:transform active:scale-95
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-500 disabled:active:transform-none"
            disabled={stake === 1 || isSpinDisabled}
          >
            <span className="inline-block w-4 text-center">-</span>
          </button>
          <span className="inline-block px-6 py-3 text-2xl font-bold bg-gray-700 w-20 text-center">
            {stake}
          </span>
          <button
            onClick={increaseStake}
            className="px-4 py-3 text-2xl font-bold bg-green-500 text-white rounded-r
                    transition duration-150 ease-in-out
                    hover:bg-green-600 active:bg-green-700 active:transform active:scale-95
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-500 disabled:active:transform-none"
            disabled={stake === 10 || stake >= balance || isSpinDisabled}
          >
            <span className="inline-block w-4 text-center">+</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Stake;
