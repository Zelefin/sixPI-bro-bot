import React from 'react';

interface SpinButtonProps {
  postSpin: () => void;
  isSpinDisabled: boolean;
}

const SpinButton: React.FC<SpinButtonProps> = ({ postSpin, isSpinDisabled }) => {
  return (
    <button 
      onClick={postSpin} 
      className={`px-8 py-3 text-2xl font-bold text-white rounded-full shadow-lg transition-colors duration-200 ${
        isSpinDisabled 
          ? 'bg-gray-600 cursor-not-allowed' 
          : 'bg-blue-500 hover:bg-blue-600'
      }`}
      disabled={isSpinDisabled}
    >
      Spin
    </button>
  );
};

export default SpinButton;
