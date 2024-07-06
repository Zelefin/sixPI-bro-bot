import React, { useState, useEffect } from 'react';

interface SlotsProps {
  startSpin: boolean;
  setIsSpinInProgress: (isSpinning: boolean) => void;
  onSpinComplete: () => void;
  spinResult: string[];
  emojis: string[];
}

const Slots: React.FC<SlotsProps> = ({ spinResult, setIsSpinInProgress, onSpinComplete, emojis, startSpin }) => {
  const getRandomEmojis = (count: number) => {
    return Array(count).fill(null).map(() => emojis[Math.floor(Math.random() * emojis.length)]);
  };

  const [displayedEmojis, setDisplayedEmojis] = useState<string[]>(() => getRandomEmojis(9));

  useEffect(() => {
    if (startSpin) {
      setIsSpinInProgress(true);
      const interval = setInterval(() => {
        setDisplayedEmojis(getRandomEmojis(9));
      }, 100);
  
      const timeout = setTimeout(() => {
        clearInterval(interval);
        const finalEmojis = [
          ...getRandomEmojis(3),
          ...spinResult,
          ...getRandomEmojis(3)
        ];
        setDisplayedEmojis(finalEmojis);
        setIsSpinInProgress(false);
        onSpinComplete();
      }, 2000);
  
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [startSpin, spinResult, setIsSpinInProgress, onSpinComplete]);

  return (
  <div className="relative">
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
    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-0 h-0 border-t-[10px] border-t-transparent border-l-[20px] border-l-yellow-400 border-b-[10px] border-b-transparent"></div>
    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-0 h-0 border-t-[10px] border-t-transparent border-r-[20px] border-r-yellow-400 border-b-[10px] border-b-transparent"></div>
  </div>
  );
};

export default Slots;
