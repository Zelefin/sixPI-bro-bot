import React from 'react';
import { LiaCoinsSolid } from "react-icons/lia";
import { GiSoundOn, GiSoundOff } from "react-icons/gi";

interface HeaderProps {
  userName: string;
  balance: number;
  soundEnabled: boolean;
  setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({ userName, balance, soundEnabled, setSoundEnabled }) => {
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  return (
    <div className="bg-[#1c2b4a] p-2 flex justify-between items-center">
      <p className="text-xl font-bold">Welcome, {userName}!</p>
      <div className='flex items-center'>
        <div className='px-4 py-2 text-2xl rounded-full bg-slate-700 flex items-center mr-2'>
          <LiaCoinsSolid className='mr-2' />
          <p className="text-xl font-bold">{balance}</p>
        </div>
        <div 
          className='px-4 py-2 text-2xl rounded-full bg-slate-700 flex items-center cursor-pointer'
          onClick={toggleSound}
        >
          {soundEnabled ? <GiSoundOn /> : <GiSoundOff />}
        </div>
      </div>
    </div>
  );
};

export default Header;
