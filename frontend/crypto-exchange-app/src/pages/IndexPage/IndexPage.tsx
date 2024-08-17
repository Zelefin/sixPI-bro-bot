import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Tabbar } from "@telegram-apps/telegram-ui";
import { MdLeaderboard, MdHistory, MdShowChart } from "react-icons/md";
import { IconType } from "react-icons";

import { MarketContent } from "@/components/MarketContent";
import { TransactionsContent } from "@/components/TransactionsContent";
import { LeaderboardContent } from "@/components/LeaderboardContent";
import { useHapticFeedback } from "@telegram-apps/sdk-react";

interface Tab {
  id: string;
  text: string;
  Icon: IconType;
  Content: React.ComponentType;
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
    Content: LeaderboardContent,
  },
];

export const IndexPage: React.FC = () => {
  const hapticFeedback = useHapticFeedback();
  const [currentTab, setCurrentTab] = useState(tabs[0].id);

  const selectedTab = tabs.find((tab) => tab.id === currentTab);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header />
      <main className="flex-grow">
        <div className="h-full">{selectedTab && <selectedTab.Content />}</div>
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
