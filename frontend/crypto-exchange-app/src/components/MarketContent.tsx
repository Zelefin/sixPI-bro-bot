import { useHapticFeedback, usePopup } from "@telegram-apps/sdk-react";
import React, { useState } from "react";
import { FullScreenSticker } from "@/components/FullScreenSticker";
import BuySticker from "@/stickers/transactionDone.json";

interface CryptoCurrency {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
}

const mockData: CryptoCurrency[] = [
  { name: "Bitcoin", symbol: "BTC", price: 50000, change24h: 2.5 },
  { name: "Ethereum", symbol: "ETH", price: 3000, change24h: -1.2 },
  { name: "Cardano", symbol: "ADA", price: 1.5, change24h: 5.7 },
  { name: "Dogecoin", symbol: "DOGE", price: 0.3, change24h: 10.1 },
  { name: "Ripple", symbol: "XRP", price: 1.2, change24h: 3.8 },
  { name: "Polkadot", symbol: "DOT", price: 30, change24h: -2.1 },
  { name: "Litecoin", symbol: "LTC", price: 180, change24h: 1.9 },
  { name: "Chainlink", symbol: "LINK", price: 25, change24h: 4.5 },
  { name: "Stellar", symbol: "XLM", price: 0.4, change24h: -0.8 },
  { name: "Uniswap", symbol: "UNI", price: 28, change24h: 6.2 },
];

const CryptoCard: React.FC<{
  currency: CryptoCurrency;
  isExpanded: boolean;
  onBuyClick: () => void;
  onConfirmBuy: () => void;
  amount: string;
  onAmountChange: (value: string) => void;
}> = ({
  currency,
  isExpanded,
  onBuyClick,
  onConfirmBuy,
  amount,
  onAmountChange,
}) => {
  const calculateCryptoAmount = (dollarAmount: string, price: number) => {
    const dollars = parseFloat(dollarAmount);
    return isNaN(dollars) || dollars <= 0 ? 0 : dollars / price;
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-all duration-300 ease-in-out ${
        isExpanded ? "row-span-2" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{currency.name}</h3>
        <span className="text-sm text-gray-500">{currency.symbol}</span>
      </div>
      <div className="text-2xl font-bold mb-2">
        ${currency.price.toLocaleString()}
      </div>
      <div
        className={`text-sm ${
          currency.change24h >= 0 ? "text-green-500" : "text-red-500"
        }`}
      >
        {currency.change24h >= 0 ? "▲" : "▼"} {Math.abs(currency.change24h)}%
      </div>
      <button
        className={`w-full mt-4 font-bold py-2 px-4 rounded transition-all duration-300 ${
          isExpanded
            ? "bg-transparent text-red-500 border-2 border-red-500"
            : "bg-blue-500 border-2 border-blue-500 text-white"
        }`}
        onClick={onBuyClick}
      >
        {isExpanded ? "Cancel" : "Buy"}
      </button>

      <div
        className={`mt-4 transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mb-4">
          <label
            htmlFor={`amount-${currency.symbol}`}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Amount to spend (USD)
          </label>
          <input
            type="number"
            id={`amount-${currency.symbol}`}
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            placeholder="Enter amount in USD"
            className="mt-1 block w-full px-3 py-2 dark:bg-slate-700 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        {amount && (
          <div className="mt-2 text-sm font-semibold">
            You will receive:{" "}
            {calculateCryptoAmount(amount, currency.price).toFixed(8)}{" "}
            {currency.symbol}
          </div>
        )}
        <button
          onClick={onConfirmBuy}
          className="w-full mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors duration-300"
        >
          Confirm Purchase
        </button>
      </div>
    </div>
  );
};

export const MarketContent: React.FC = () => {
  const hapticFeedback = useHapticFeedback();
  const popup = usePopup();
  const [showSticker, setShowSticker] = useState(false);
  const [expandedCrypto, setExpandedCrypto] = useState<string | null>(null);
  const [amounts, setAmounts] = useState<{ [key: string]: string }>({});

  const handleBuyClick = (symbol: string) => {
    hapticFeedback.impactOccurred("light");
    setExpandedCrypto(expandedCrypto === symbol ? null : symbol);
    if (!amounts[symbol]) {
      setAmounts({ ...amounts, [symbol]: "" });
    }
  };

  const handleConfirmBuy = (crypto: CryptoCurrency) => {
    const amount = parseFloat(amounts[crypto.symbol]);

    if (isNaN(amount) || amount <= 0) {
      hapticFeedback.notificationOccurred("error");
      setAmounts({ ...amounts, [crypto.symbol]: "" });

      popup.open({
        title: "Invalid Amount",
        message: "Please enter a valid amount greater than 0.",
        buttons: [{ id: "lala", type: "ok" }],
      });

      return;
    }

    console.log(
      `Buying $${amount} worth of ${crypto.symbol} at $${crypto.price}`
    );
    setShowSticker(true);
    setExpandedCrypto(null);
    setAmounts({ ...amounts, [crypto.symbol]: "" });
    hapticFeedback.notificationOccurred("success");
  };

  const handleAmountChange = (symbol: string, value: string) => {
    setAmounts({ ...amounts, [symbol]: value });
  };

  return (
    <>
      <div className="h-full overflow-y-auto p-4 mb-24">
        <h2 className="text-2xl font-bold mb-4 top-0 py-2">Crypto Market</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockData.map((currency) => (
            <CryptoCard
              key={currency.symbol}
              currency={currency}
              isExpanded={expandedCrypto === currency.symbol}
              onBuyClick={() => handleBuyClick(currency.symbol)}
              onConfirmBuy={() => handleConfirmBuy(currency)}
              amount={amounts[currency.symbol] || ""}
              onAmountChange={(value) =>
                handleAmountChange(currency.symbol, value)
              }
            />
          ))}
        </div>
      </div>
      {showSticker && (
        <FullScreenSticker
          stickerSrc={BuySticker}
          onClose={() => setShowSticker(false)}
        />
      )}
    </>
  );
};
