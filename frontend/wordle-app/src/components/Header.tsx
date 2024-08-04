import React, { useState } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import UAflag from "./UAflag.json";
import { HowToPlayPopup } from "./HowToPlayPopup";
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
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);

  const openHowToPlay = () => setIsHowToPlayOpen(true);
  const closeHowToPlay = () => setIsHowToPlayOpen(false);

  return (
    <>
      <header className="flex flex-nowrap items-center justify-between max-w-4xl w-screen">
        <DayCounter />
        <FlagAnimation />
        <HelpButton onClick={openHowToPlay} />
      </header>
      <HowToPlayPopup isOpen={isHowToPlayOpen} onClose={closeHowToPlay} />
    </>
  );
};
