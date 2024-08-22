import React from "react";

interface NoResultsProps {
  message: string;
}

const NoResults: React.FC<NoResultsProps> = ({ message }) => {
  return (
    <div className="flex items-center justify-center h-full w-full mt-36 px-5">
      <div className="flex flex-col items-center text-center">
        <p className="text-2xl font-bold">{message}</p>
      </div>
    </div>
  );
};

export default NoResults;
