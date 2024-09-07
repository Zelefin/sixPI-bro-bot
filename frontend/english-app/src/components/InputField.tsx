import React, { useState, useCallback } from "react";

interface InputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
}

const InputField: React.FC<InputFieldProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        onSubmit();
      }
    },
    [onSubmit]
  );

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`
          w-full py-2 px-3
          bg-gray-100 dark:bg-gray-700
          text-tg-text-color dark:text-gray-200
          border-b-2 ${
            isFocused
              ? "border-tg-button-color"
              : "border-gray-300 dark:border-gray-600"
          }
          focus:outline-none
          transition-all duration-300
          rounded-none
        `}
        placeholder={placeholder}
      />
      <div
        className={`
          absolute bottom-0 left-0 w-full h-0.5
          bg-tg-button-color
          transform origin-bottom-left
          transition-all duration-300 ease-out
          ${isFocused ? "scale-x-100" : "scale-x-0"}
        `}
      />
    </div>
  );
};

export default InputField;
