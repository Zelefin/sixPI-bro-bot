import React, { useState, useEffect } from 'react';

interface SlotsProps {
  spinResult: string[];
  emojis: string[];
  onSpinningChange: (isSpinning: boolean) => void;
  onSpinComplete: () => void;
  startSpin: boolean;
}

const Slots: React.FC<SlotsProps> = ({ spinResult, onSpinningChange, onSpinComplete, emojis, startSpin }) => {
  const getRandomEmojis = (count: number) => {
    return Array(count).fill(null).map(() => emojis[Math.floor(Math.random() * emojis.length)]);
  };

  const [displayedEmojis, setDisplayedEmojis] = useState<string[]>(() => getRandomEmojis(9));

  useEffect(() => {
    if (startSpin) {
      onSpinningChange(true);
      const interval = setInterval(() => {
        setDisplayedEmojis(getRandomEmojis(9));
      }, 100);
  
      setTimeout(() => {
        clearInterval(interval);
        const finalEmojis = [
          ...getRandomEmojis(3),
          ...spinResult,
          ...getRandomEmojis(3)
        ];
        setDisplayedEmojis(finalEmojis);
        onSpinningChange(false);
        onSpinComplete();
      }, 2000);
  
      return () => clearInterval(interval);
    }
  }, [startSpin, spinResult, onSpinningChange, onSpinComplete]);

  return (
    <div className="grid grid-cols-3 gap-2 m-4">
      {displayedEmojis.map((emoji, index) => (
        <div 
          key={index} 
          className={`text-6xl font-bold w-20 h-20 flex items-center justify-center bg-gray-800 rounded ${
            index >= 3 && index < 6 ? 'border-2 border-yellow-400' : ''
          }`}
        >
          {emoji}
        </div>
      ))}
    </div>
  );
};

export default Slots;
