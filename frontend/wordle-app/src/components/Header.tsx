import React, { useState } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import UAflag from "./UAflag.json";
import { HowToPlayPopup } from "./HowToPlayPopup";
import { LeaderboardPopup } from "./LeaderboardPopup";
import { calculateDayNumber } from "@/utils/dayCalculator";

const DayCounter: React.FC = () => {
  const dayNumber = calculateDayNumber();

  return (
    <div className="p-4 text-lg text-center font-bold basis-1/4 flex flex-row items-center justify-center">
      <h1 className="text-text-color">Day #{dayNumber}</h1>
    </div>
  );
};

const FlagAnimation: React.FC = () => {
  const playerRef = React.useRef<Player>(null);

  return (
    <div
      className="p-4 text-2xl font-bold basis-1/2 center align-middle flex flex-row items-center justify-center gap-2"
      onClick={() => playerRef.current?.play()}
    >
      <div className="w-16 h-16">
        <Player src={UAflag} ref={playerRef} autoplay loop={false} />
      </div>
    </div>
  );
};

const LeaderboardButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className="text-2xl font-bold text-hint-color basis-1/4 flex flex-row items-center justify-center">
    <button className="w-8 h-8" onClick={onClick}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="w-8 h-8"
      >
        <path
          fillRule="evenodd"
          d="M12.8 11.2l1.2 3.3a.66.66 0 00.6.45l3.3.14a.7.7 0 01.39 1.23l-2.6 2.2a.72.72 0 00-.23.73l.92 3.4a.67.67 0 01-1 .76l-2.9-2a.62.62 0 00-.74 0l-2.9 2a.67.67 0 01-1-.76l.92-3.4a.72.72 0 00-.23-.73l-2.6-2.2a.7.7 0 01.39-1.23l3.3-.14a.66.66 0 00.6-.45l1.2-3.3a.66.66 0 011.26 0zM5.7.74 6.58 3.2a.5.5 0 00.45.34l2.53.1a.52.52 0 01.29.93l-2 1.66a.52.52 0 00-.17.54l.69 2.55a.5.5 0 01-.75.58L5.5 8.44a.46.46 0 00-.54 0L2.84 9.9a.5.5 0 01-.75-.58l.69-2.55a.52.52 0 00-.17-.54l-2-1.66a.52.52 0 01.29-.93l2.53-.1a.5.5 0 00.45-.34L4.76.74a.49.49 0 01.93 0zm13.6 0 .88 2.46a.5.5 0 00.45.34l2.53.1a.52.52 0 01.29.93l-2 1.66a.52.52 0 00-.17.54l.69 2.55a.5.5 0 01-.75.58l-2.12-1.46a.46.46 0 00-.54 0l-2.12 1.46a.5.5 0 01-.75-.58l.69-2.55a.52.52 0 00-.17-.54l-2-1.66a.52.52 0 01.29-.93l2.53-.1a.5.5 0 00.45-.34L18.37.74a.49.49 0 01.93 0z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  </div>
);

const HelpButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className="p-4 text-2xl font-bold text-hint-color basis-1/4 flex flex-row items-center justify-end gap-2">
    <button className="w-8 h-8" onClick={onClick}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="w-8 h-8"
      >
        <path
          fillRule="evenodd"
          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.75a.75.75 0 01-1.5 0v-.75c0-1.279 1.06-2.107 1.875-2.502.182-.088.351-.199.503-.331.83-.727.83-1.857 0-2.584zM12 18a.75.75 0 100-1.5.75.75 0 000 1.5z"
          clipRule="evenodd"
        ></path>
      </svg>
    </button>
  </div>
);

export const Header: React.FC = () => {
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);

  const openLeaderboard = () => setLeaderboardOpen(true);
  const closeLeaderboard = () => setLeaderboardOpen(false);

  const openHowToPlay = () => setIsHowToPlayOpen(true);
  const closeHowToPlay = () => setIsHowToPlayOpen(false);

  return (
    <>
      <header className="flex flex-nowrap items-center justify-between max-w-4xl w-screen">
        <DayCounter />
        <FlagAnimation />
        <div className="flex">
          <LeaderboardButton onClick={openLeaderboard} />
          <HelpButton onClick={openHowToPlay} />
        </div>
      </header>
      <HowToPlayPopup isOpen={isHowToPlayOpen} onClose={closeHowToPlay} />
      <LeaderboardPopup isOpen={leaderboardOpen} onClose={closeLeaderboard} />
    </>
  );
};
