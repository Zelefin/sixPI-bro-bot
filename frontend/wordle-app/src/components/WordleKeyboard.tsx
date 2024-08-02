import React, { useCallback, useEffect, useRef } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { useMiniApp } from "@telegram-apps/sdk-react";

interface WordleKeyboardProps {
  onKeyPress: (key: string) => void;
  letterStatuses: {
    [key: string]: "correct" | "misplaced" | "incorrect" | "unused";
  };
}

const keyboardLayout = {
  default: [
    "й ц у к е н г ш щ з х ї",
    "ф і в а п р о л д ж є",
    "{enter} я ч с м и т ь б ю {bksp}",
  ],
};

const buttonTheme = [
  {
    class: "letter-button",
    buttons:
      "й ц у к е н г ш щ з х ї ф і в а п р о л д ж є я ч с м и т ь б ю {bksp}",
  },
  {
    class: "enter",
    buttons: "{enter}",
  },
];

export const WordleKeyboard: React.FC<WordleKeyboardProps> = ({
  onKeyPress,
  letterStatuses,
}) => {
  const keyboardRef = useRef<any>(null);
  const miniApp = useMiniApp();

  const handleKeyPress = useCallback(
    (button: string) => {
      const mappedButton =
        button === "{enter}"
          ? "ENTER"
          : button === "{bksp}"
          ? "BACKSPACE"
          : button.toUpperCase();
      onKeyPress(mappedButton);
    },
    [onKeyPress]
  );

  useEffect(() => {
    if (keyboardRef.current) {
      Object.entries(letterStatuses).forEach(([letter, status]) => {
        const buttonElement = keyboardRef.current.getButtonElement(letter);
        if (buttonElement) {
          buttonElement.classList.remove("correct", "misplaced", "incorrect");
          if (status !== "unused") {
            buttonElement.classList.add(status);
          }
        }
      });
    }
  }, [letterStatuses]);

  const backspaceIcon = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1"
      stroke=${miniApp.isDark ? "white" : "black"}
      class="w-7 h-7"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z"
      />
    </svg>
  `;

  const display = {
    "{enter}": "ENTER",
    "{bksp}": backspaceIcon,
  };

  return (
    <Keyboard
      keyboardRef={(r) => (keyboardRef.current = r)}
      layout={keyboardLayout}
      onKeyPress={handleKeyPress}
      display={display}
      buttonTheme={buttonTheme}
      mergeDisplay={true}
    />
  );
};
