import React, { useEffect } from "react";
import { useTheme } from "@/components/ThemeContext";

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  header: string;
  children: React.ReactNode;
}

export const Popup: React.FC<PopupProps> = ({
  isOpen,
  onClose,
  header,
  children,
}) => {
  const { theme } = useTheme();

  // Effect to disable scrolling when the popup is open
  useEffect(() => {
    if (isOpen) {
      // Disable scrolling
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable scrolling
      document.body.style.overflow = "";
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
              {header}
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
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
