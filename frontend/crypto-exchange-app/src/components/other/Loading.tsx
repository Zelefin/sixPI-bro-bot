import React from "react";
import { Spinner } from "@telegram-apps/telegram-ui";

const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full w-full mt-36">
      <div className="flex flex-col items-center">
        <Spinner size="l" />
        <p className="font-bold text-xl mt-4">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
