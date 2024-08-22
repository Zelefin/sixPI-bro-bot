import React, { useState, useEffect } from "react";
import {
  useHapticFeedback,
  useLaunchParams,
  usePopup,
} from "@telegram-apps/sdk-react";
import { FullScreenSticker } from "@/components/other/FullScreenSticker";
import BuySticker from "@/stickers/transactionDone.json";
import { CoinInfo } from "@/utils/responseTypes";
import { CoinCard } from "./CoinCard";
import NoResults from "../other/NoResults";
import Loading from "../other/Loading";
import ErrorMsg from "../other/ErrorMsg";

interface MarketContentProps {
  setBalance: React.Dispatch<React.SetStateAction<number>>;
}

export const MarketContent: React.FC<MarketContentProps> = ({ setBalance }) => {
  const hapticFeedback = useHapticFeedback();
  const popup = usePopup();
  const { initDataRaw } = useLaunchParams();
  const [showSticker, setShowSticker] = useState(false);
  const [expandedCrypto, setExpandedCrypto] = useState<number | null>(null);
  const [amounts, setAmounts] = useState<{ [key: number]: string }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currencies, setCurrencies] = useState<CoinInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/crypto-exchange/basic_coins");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.ok && Array.isArray(data.coins_infos)) {
        setCurrencies(data.coins_infos);
      } else {
        throw new Error("Invalid data format received from server");
      }
    } catch (e) {
      setError(true);
      console.error("Failed to fetch currencies:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("_auth", initDataRaw || "");
      formData.append("coin_symbol", searchQuery.toUpperCase());

      const response = await fetch("/crypto-exchange/search", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.ok && data.coins_info) {
        setCurrencies(
          Array.isArray(data.coins_info) ? data.coins_info : [data.coins_info]
        );
      } else {
        throw new Error("Invalid data format received from server");
      }
    } catch (e) {
      setError(true);
      console.error("Search failed:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyClick = (id: number) => {
    hapticFeedback.impactOccurred("light");
    setExpandedCrypto(expandedCrypto === id ? null : id);
    if (!amounts[id]) {
      setAmounts({ ...amounts, [id]: "" });
    }
  };

  const handleConfirmBuy = async (coin: CoinInfo) => {
    const amount = parseFloat(amounts[coin.id]);

    if (isNaN(amount) || amount <= 0) {
      hapticFeedback.notificationOccurred("error");
      setAmounts({ ...amounts, [coin.id]: "" });
      popup.open({
        title: "Invalid Amount",
        message: "Please enter a valid amount greater than 0.",
        buttons: [{ id: "ok", type: "ok" }],
      });
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append("_auth", initDataRaw || "");
      formData.append("coin_id", coin.id.toString());
      formData.append("points", amount.toString());

      const response = await fetch("/crypto-exchange/buy", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      if (data.ok) {
        setShowSticker(true);
        setExpandedCrypto(null);
        setBalance(data.new_balance);
        setAmounts({ ...amounts, [coin.id]: "" });
        hapticFeedback.notificationOccurred("success");
      } else {
        throw new Error(data.err || "Purchase failed");
      }
    } catch (e) {
      hapticFeedback.notificationOccurred("error");
      console.error("Purchase failed:", e);
      popup.open({
        title: "Purchase Failed",
        message: "Try again later",
        buttons: [{ id: "ok", type: "ok" }],
      });
    }
  };

  const handleAmountChange = (id: number, value: string) => {
    setAmounts({ ...amounts, [id]: value });
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loading />;
    }
    if (error) {
      return <ErrorMsg message="An error occurred 😿" />;
    }
    if (currencies.length === 0) {
      return <NoResults message="0 coins found 🫥" />;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-24">
        {currencies.map((currency) => (
          <CoinCard
            key={currency.id}
            currency={currency}
            isExpanded={expandedCrypto === currency.id}
            onBuyClick={() => handleBuyClick(currency.id)}
            onConfirmBuy={() => handleConfirmBuy(currency)}
            amount={amounts[currency.id] || ""}
            onAmountChange={(value) => handleAmountChange(currency.id, value)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col p-4">
      <h2 className="text-2xl font-bold mb-4">Crypto Market</h2>
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
      />
      <h3 className="text-lg text-gray-800 dark:text-gray-200 mb-4">
        ✨ Or buy popular cryptocurrencies
      </h3>
      <div className="flex-grow overflow-y-auto">{renderContent()}</div>
      {showSticker && (
        <FullScreenSticker
          stickerSrc={BuySticker}
          onClose={() => setShowSticker(false)}
        />
      )}
    </div>
  );
};

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
}) => (
  <div className="mb-4 space-y-2">
    <h3 className="text-lg text-gray-800 dark:text-gray-200">
      🔎 Search crypto
    </h3>
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Enter symbol (e.g., BTC)"
      className="w-full rounded-md bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
    />
    <button
      onClick={handleSearch}
      className="w-full rounded-md bg-blue-500 text-white font-semibold px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-500 active:bg-blue-600 dark:active:bg-blue-700 transition-colors duration-200"
    >
      Search
    </button>
  </div>
);
