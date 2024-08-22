import React from "react";

interface ErrorMsgProps {
  message: string;
}

const ErrorMsg: React.FC<ErrorMsgProps> = ({ message }) => {
  return (
    <div className="flex items-center justify-center h-full w-full mt-36">
      <div className="flex flex-col items-center text-center">
        <p className="text-2xl font-bold text-red-500">{message}</p>
        <p className="mt-2 text-xl text-red-500">Try again later!</p>
      </div>
    </div>
  );
};

export default ErrorMsg;
