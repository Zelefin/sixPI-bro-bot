import React from 'react';
import { LiaCoinsSolid } from "react-icons/lia";

interface HeaderProps {
  userName: string;
  balance: number;
}

const Header: React.FC<HeaderProps> = ({ userName, balance }) => {
  return (
    <div className="bg-[#1c2b4a] p-2 flex justify-between items-center">
      <p className="text-xl font-bold">Welcome {userName}!</p>
      <div className='px-4 py-2 text-2xl rounded-full bg-slate-700 flex items-center'>
        <LiaCoinsSolid className='mr-2' />
        <p className="text-xl font-bold">{balance}</p>
      </div>
    </div>
  );
};

export default Header;
