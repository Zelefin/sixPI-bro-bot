import React from "react";
import { LiaCoinsSolid } from "react-icons/lia";

interface HeaderProps {
  userName: string;
  balance: number;
}

const Header: React.FC<HeaderProps> = ({ userName, balance }) => {
  return (
    <div className="bg-section-bg-color p-2 flex justify-between items-center">
      <p className="text-xl font-bold">Welcome, {userName}!</p>
      <div className="flex items-center">
        <div className="px-4 py-2 rounded-full bg-secondary-bg-color flex items-center mr-2">
          <LiaCoinsSolid className="mr-2" size={24} />
          <p className="text-xl font-bold">{balance}</p>
        </div>
      </div>
    </div>
  );
};

export default Header;
