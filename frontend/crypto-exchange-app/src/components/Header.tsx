import { Player } from "@lottiefiles/react-lottie-player";
import WelcomeSticker from "@/stickers/welcome.json";
import React from "react";
import { AiFillDollarCircle } from "react-icons/ai";

const WelcomeAnimation: React.FC = () => {
  const playerRef = React.useRef<Player>(null);

  return (
    <div
      className="w-16 h-16 cursor-pointer"
      onClick={() => playerRef.current?.play()}
    >
      <Player src={WelcomeSticker} ref={playerRef} autoplay loop={false} />
    </div>
  );
};

export const Header: React.FC<{ firstName: string; balance: number }> = ({
  firstName,
  balance,
}) => {
  return (
    <header className="flex items-center justify-between px-4 py-2 max-w-4xl w-full mx-auto shadow-custom-bottom">
      <div className="flex-1">
        <p className="text-xl font-bold">Welcome, {firstName}!</p>
      </div>
      <div className="flex-1 flex justify-center">
        <WelcomeAnimation />
      </div>
      <div className="flex-1 flex justify-end">
        <div className="px-4 py-2 text-2xl rounded-full bg-slate-100 dark:bg-slate-700 flex items-center">
          <AiFillDollarCircle className="mr-2" />
          <p className="text-xl font-bold">{balance}</p>
        </div>
      </div>
    </header>
  );
};
