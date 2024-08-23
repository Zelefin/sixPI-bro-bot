import React, { useEffect, useState } from "react";
import { Popup } from "@/components/Popup";
import { LeaderboardEntry, LeaderboardResponse } from "@/types";

interface LeaderboardPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to get the current date in a readable format
const getCurrentDate = (): string => {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// LeaderboardList component to display leaderboard entries
const LeaderboardList: React.FC = () => {
  const [leaderboardEntries, setLeaderboardEntries] = useState<
    LeaderboardEntry[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/wordle/leaderboard", {
          method: "GET",
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        });

        const data: LeaderboardResponse = await response.json();
        setLeaderboardEntries(data.users);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        alert("Failed to load leaderboard. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return <p>Loading leaderboard...</p>;
  }

  if (leaderboardEntries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-text-color">
          No players yet today. Be the first! 💡
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mt-4 text-xl font-bold">Today's Top Players</h2>
      <div className="mt-3">
        <ul className="space-y-2">
          {leaderboardEntries.map((entry, index) => (
            <li
              key={index}
              className="flex items-center justify-between transition-all duration-300 hover:scale-102"
            >
              <div className="flex items-center">
                <span className="font-bold text-lg text-text-color mr-2">
                  {index + 1}.
                </span>
                <span className="font-medium text-text-color">
                  {entry.full_name}
                </span>
              </div>
              <span
                className={`font-semibold text-lg ${
                  index === 0
                    ? "animate-gradient-x bg-gradient-to-r from-yellow-400 via-yellow-100 to-yellow-400 bg-300% bg-clip-text text-transparent"
                    : index === 1
                    ? "animate-gradient-x bg-gradient-to-r from-gray-400 via-gray-100 to-gray-400 bg-300% bg-clip-text text-transparent"
                    : index === 2
                    ? "animate-gradient-x bg-gradient-to-r from-yellow-600 via-orange-200 to-yellow-600 bg-300% bg-clip-text text-transparent"
                    : "text-text-color"
                }`}
              >
                {entry.guesses} {entry.guesses === 1 ? "guess" : "guesses"} (+
                {entry.coins_earned} coins)
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export const LeaderboardPopup: React.FC<LeaderboardPopupProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Popup isOpen={isOpen} onClose={onClose} header="Daily Leaderboard">
      <p className="font-2xl">Today's Wordle Challenge - {getCurrentDate()}</p>
      <LeaderboardList />
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Play today's wordle to join the leaderboard. New challenge every day!
      </p>
    </Popup>
  );
};
