import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Tabbar } from "@telegram-apps/telegram-ui";
import { MdLeaderboard, MdHistory, MdShowChart } from "react-icons/md";
import { IconType } from "react-icons";

import { MarketContent } from "@/components/Market/MarketContent";
import { TransactionsContent } from "@/components/Transactions/TransactionsContent";
import { LeaderboardContent } from "@/components/Leaderboard/LeaderboardContent";
import { useHapticFeedback, useLaunchParams } from "@telegram-apps/sdk-react";

interface ContentProps {
  setBalance: React.Dispatch<React.SetStateAction<number>>;
}

interface Tab {
  id: string;
  text: string;
  Icon: IconType;
  Content: React.ComponentType<ContentProps>;
}

const tabs: Tab[] = [
  {
    id: "market",
    text: "Market",
    Icon: MdShowChart,
    Content: MarketContent,
  },
  {
    id: "transactions",
    text: "Transactions",
    Icon: MdHistory,
    Content: TransactionsContent,
  },
  {
    id: "leaderboard",
    text: "Leaderboard",
    Icon: MdLeaderboard,
    Content: LeaderboardContent as React.ComponentType<ContentProps>,
  },
];

export const IndexPage: React.FC = () => {
  const hapticFeedback = useHapticFeedback();
  const initData = useLaunchParams().initData;
  const [balance, setBalance] = useState(0);
  const [currentTab, setCurrentTab] = useState(tabs[0].id);

  const selectedTab = tabs.find((tab) => tab.id === currentTab);

  useEffect(() => {
    const fetchUserBalance = async () => {
      try {
        const response = await fetch(
          `/get_balance?user_id=${initData?.user?.id}`,
          {
            method: "GET",
            headers: {
              "ngrok-skip-browser-warning": "69420",
            },
          }
        );

        const data = await response.json();
        setBalance(data.balance);
      } catch (e) {
        console.error("Error fetching balance:", e);
      }
    };

    fetchUserBalance();
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        firstName={initData?.user?.firstName || "undef"}
        balance={balance}
      />
      <main className="flex-grow">
        <div className="h-full">
          {selectedTab && <selectedTab.Content setBalance={setBalance} />}
        </div>
      </main>
      <Tabbar className="flex bg-theme-bg-color px-4 pb-4 shadow-custom-top">
        {tabs.map(({ id, text, Icon }) => (
          <Tabbar.Item
            key={id}
            text={text}
            selected={id === currentTab}
            onClick={() => {
              hapticFeedback.impactOccurred("medium");
              setCurrentTab(id);
            }}
          >
            <Icon size={24} />
          </Tabbar.Item>
        ))}
      </Tabbar>
    </div>
  );
};
