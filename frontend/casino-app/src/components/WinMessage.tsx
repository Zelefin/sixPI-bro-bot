import React from 'react';

interface WinMessageProps {
  spinAction: string;
  winAmount: number;
}

const WinMessage: React.FC<WinMessageProps> = ({ spinAction, winAmount }) => {
  if (spinAction === 'win') {
    return (
        <p className="text-2xl font-bold text-green-500 mt-4">
            You won: {winAmount}
        </p>
    );
  } else {
    return null;
  }
};

export default WinMessage;
