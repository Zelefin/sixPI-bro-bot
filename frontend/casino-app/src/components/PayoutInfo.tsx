import React from 'react';

interface PayoutInfoProps {
  emojis: string[];
  multipliers: number[];
}

const PayoutInfo: React.FC<PayoutInfoProps> = ({ emojis, multipliers }) => {
  return (
    <div className="bg-gray-800 rounded-b-xl p-4 flex flex-wrap justify-center gap-4 mb-4 mx-auto">
      {emojis.map((emoji, index) => (
        <div key={index} className="flex items-center space-x-2">
          <span className="text-3xl">{emoji}</span>
          <span className="text-xl font-bold">x {multipliers[index]}</span>
        </div>
      ))}
    </div>
  );
};

export default PayoutInfo;
