import React, { useEffect } from "react";
import { useTheme } from "./ThemeContext";

interface HowToPlayPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayPopup: React.FC<HowToPlayPopupProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme } = useTheme();

  // Effect to disable scrolling when the popup is open
  useEffect(() => {
    if (isOpen) {
      // Disable scrolling
      document.body.style.overflow = "hidden";
      // Optional: you might want to store the current scroll position
      // const scrollY = window.scrollY;
      // document.body.style.position = 'fixed';
      // document.body.style.top = `-${scrollY}px`;
    } else {
      // Re-enable scrolling
      document.body.style.overflow = "";
      // Optional: restore scroll position
      // const scrollY = document.body.style.top;
      // document.body.style.position = '';
      // document.body.style.top = '';
      // window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    // Cleanup function to ensure scrolling is re-enabled when component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 left-0 z-50 h-modal h-screen overflow-y-auto overflow-x-hidden md:inset-0 md:h-full items-center justify-center flex bg-gray-900 bg-opacity-50 dark:bg-opacity-80">
      <div className="relative h-full w-full p-4 md:h-auto max-w-2xl">
        <div
          className={`relative rounded-lg bg-white shadow dark:bg-gray-800 flex flex-col max-h-[90vh] ${theme}`}
        >
          <div className="flex items-start justify-between rounded-t dark:border-gray-600 border-b p-5">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              How to play
            </h3>
            <button
              onClick={onClose}
              className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-5 w-5"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
          <div className="p-6 flex-1 overflow-auto text-text-color">
            <p className="font-2xl">Guess the word in 6 tries</p>
            <ul className="list-disc list-inside mt-4">
              <li>Each guess must be a valid 5-letter word</li>
              <li>
                The color of the tiles will change to show how close your guess
                was to the word
              </li>
            </ul>
            <h2 className="mt-4 text-xl">Examples</h2>
            <div>
              <div className="mt-3 grid grid-cols-5 gap-[2px]">
                {["W", "E", "A", "R", "Y"].map((letter, index) => (
                  <div
                    key={index}
                    className={` w-10 h-10 flex items-center border justify-center font-bold text-text-color ${
                      index === 0
                        ? "bg-correct-letter-color text-white"
                        : "bg-theme-bg-color"
                    }`}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <p>
                <strong>W</strong> is in the word and in the correct spot
              </p>
              <div className="mt-3 grid grid-cols-5 gap-[2px]">
                {["P", "I", "L", "L", "S"].map((letter, index) => (
                  <div
                    key={index}
                    className={`w-10 h-10 flex items-center border justify-center font-bold text-text-color ${
                      index === 1
                        ? "bg-misplaced-letter-color text-white"
                        : "bg-theme-bg-color"
                    }`}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <p>
                <strong>I</strong> is in the word but in the wrong spot
              </p>
              <div className="mt-3 grid grid-cols-5 gap-[2px]">
                {["V", "A", "G", "U", "E"].map((letter, index) => (
                  <div
                    key={index}
                    className={`w-10 h-10 flex items-center border justify-center font-bold text-text-color ${
                      index === 3
                        ? "bg-incorrect-letter-color text-white"
                        : "bg-theme-bg-color"
                    }`}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <p>
                <strong>U</strong> is not in the word in any spot
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
