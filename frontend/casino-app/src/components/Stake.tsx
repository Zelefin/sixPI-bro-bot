import React from 'react';

interface StakeProps {
  stake: number;
  balance: number;
  decreaseStake: () => void;
  increaseStake: () => void;
}

const Stake: React.FC<StakeProps> = ({ stake, balance, decreaseStake, increaseStake }) => {
  return (
    <div>
      <p className='text-2xl font-bold text-center'>Stake</p>
      <div className="flex items-center justify-center">
        <div className="flex">
          <button 
            onClick={decreaseStake} 
            className="px-4 py-2 text-2xl font-bold bg-red-500 text-white rounded-l disabled:opacity-50"
            disabled={stake === 1}
          >
            -
          </button>
          <span className="px-6 py-2 text-2xl font-bold bg-gray-700">{stake}</span>
          <button 
            onClick={increaseStake} 
            className="px-4 py-2 text-2xl font-bold bg-green-500 text-white rounded-r disabled:opacity-50"
            disabled={stake === 10 || stake >= balance}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default Stake;
