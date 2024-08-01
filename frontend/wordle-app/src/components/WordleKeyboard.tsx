import { useMiniApp } from "@telegram-apps/sdk-react";
import React, { useCallback, useEffect, useRef } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

interface WordleKeyboardProps {
  onKeyPress: (key: string) => void;
  letterStatuses: {
    [key: string]: "correct" | "misplaced" | "incorrect" | "unused";
  };
}

const keyboardLayout = {
  default: [
    "Й Ц У К Е Н Г Ш Щ З Х Ї",
    "Ф І В А П Р О Л Д Ж Є",
    "{enter} Я Ч С М И Т Ь Б Ю {bksp}",
  ],
};

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
          buttonElement.classList.remove(
            "bg-correct-letter-color",
            "bg-misplaced-letter-color",
            "bg-incorrect-letter-color",
            "text-white"
          );
          if (status !== "unused") {
            buttonElement.classList.add(
              `!bg-${status}-letter-color`,
              "text-white"
            );
          }
        }
      });
    }
  }, [letterStatuses]);

  const buttonTheme = [
    {
      class: `${
        miniApp.isDark
          ? "!bg-default-dark-letter-color active:!bg-clicked-default-dark-letter-color !text-white"
          : "!bg-default-light-letter-color active:!bg-clicked-default-light-letter-color !text-black"
      } text-white font-bold`,
      buttons:
        "Й Ц У К Е Н Г Ш Щ З Х Ї Ф І В А П Р О Л Д Ж Є Я Ч С М И Т Ь Б Ю",
    },
    {
      class: `${
        miniApp.isDark
          ? "!bg-button-color active:!bg-clicked-default-dark-letter-color"
          : "!bg-button-color active:!bg-clicked-default-light-letter-color active:!text-black"
      } text-white font-bold`,
      buttons: "{enter}",
    },
    {
      class: `${
        miniApp.isDark
          ? "!bg-default-dark-letter-color active:!bg-clicked-default-dark-letter-color"
          : "!bg-default-light-letter-color active:!bg-clicked-default-light-letter-color"
      }`,
      buttons: "{bksp}",
    },
  ];

  const backspaceIcon = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1"
    stroke=${miniApp.isDark ? "white" : "black"}
    class="w-7 h-7"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z"
    ></path>
  </svg>
`;

  const display = {
    "{enter}": "ENTER",
    "{bksp}": `${backspaceIcon}`,
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
