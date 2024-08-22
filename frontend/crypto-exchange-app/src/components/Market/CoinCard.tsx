import { CoinInfo } from "../../utils/responseTypes";
import { formatNumber } from "@/utils/numberFormatting";

export const CoinCard: React.FC<{
  currency: CoinInfo;
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
        {formatNumber(currency.price, true, 6)}
      </div>
      <div
        className={`text-sm ${
          currency.change24h >= 0 ? "text-green-500" : "text-red-500"
        }`}
      >
        {currency.change24h >= 0 ? "▲" : "▼"}{" "}
        {Math.abs(currency.change24h).toFixed(2)}%
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

      {isExpanded && (
        <div className="mt-4">
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
              {formatNumber(
                calculateCryptoAmount(amount, currency.price),
                false,
                8
              )}{" "}
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
      )}
    </div>
  );
};
