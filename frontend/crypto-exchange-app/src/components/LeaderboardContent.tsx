import React from "react";

interface TopTransaction {
  id: number;
  user_id: number;
  full_name: string;
  crypto: string;
  amount: number;
  points_spent: number;
  buy_price: number;
  sell_price: number | null;
  profit: number | null;
  open_date: string;
  close_date: string | null;
  estimated_sell_price: number;
  estimated_profit: number;
}

const mockTopTransactions: TopTransaction[] = [
  {
    id: 1,
    user_id: 102,
    full_name: "Jane Smith",
    crypto: "ETH",
    amount: 10,
    points_spent: 30000,
    buy_price: 3000,
    sell_price: null,
    profit: null,
    open_date: "2023-08-11T11:15:00",
    close_date: null,
    estimated_sell_price: 3500,
    estimated_profit: 5000,
  },
  {
    id: 2,
    user_id: 101,
    full_name: "John Doe",
    crypto: "BTC",
    amount: 0.5,
    points_spent: 25000,
    buy_price: 50000,
    sell_price: 55000,
    profit: 2500,
    open_date: "2023-08-10T09:30:00",
    close_date: "2023-08-15T14:45:00",
    estimated_sell_price: 55000,
    estimated_profit: 2500,
  },
  {
    id: 3,
    user_id: 103,
    full_name: "Bob Johnson",
    crypto: "ADA",
    amount: 5000,
    points_spent: 7500,
    buy_price: 1.5,
    sell_price: 2.0,
    profit: 2500,
    open_date: "2023-08-12T13:45:00",
    close_date: "2023-08-15T10:00:00",
    estimated_sell_price: 2.0,
    estimated_profit: 2500,
  },
  {
    id: 4,
    user_id: 104,
    full_name: "Alice Brown",
    crypto: "DOGE",
    amount: 20000,
    points_spent: 6000,
    buy_price: 0.3,
    sell_price: null,
    profit: null,
    open_date: "2023-08-13T10:00:00",
    close_date: null,
    estimated_sell_price: 0.4,
    estimated_profit: 2000,
  },
  {
    id: 5,
    user_id: 105,
    full_name: "Charlie Wilson",
    crypto: "BTC",
    amount: 0.2,
    points_spent: 10000,
    buy_price: 50000,
    sell_price: 52000,
    profit: 400,
    open_date: "2023-08-14T14:30:00",
    close_date: "2023-08-15T11:45:00",
    estimated_sell_price: 52000,
    estimated_profit: 400,
  },
];

const LeaderboardEntry: React.FC<{
  transaction: TopTransaction;
  rank: number;
}> = ({ transaction, rank }) => {
  const isOpen = transaction.close_date === null;
  const profitValue = isOpen
    ? transaction.estimated_profit
    : transaction.profit!;

  // Function to format date strings
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString();
  };

  return (
    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
      <td className="px-6 py-4 font-medium">{rank}</td>
      <td className="px-6 py-4">{transaction.full_name}</td>
      <td className="px-6 py-4">{transaction.crypto}</td>
      <td className="px-6 py-4">{transaction.amount}</td>
      <td
        className={`px-6 py-4 ${isOpen ? "text-yellow-500" : "text-green-500"}`}
      >
        {isOpen
          ? `Est. $${profitValue.toFixed(2)}`
          : `$${profitValue.toFixed(2)}`}
      </td>
      <td className="px-6 py-4">{formatDate(transaction.open_date)}</td>
      <td className="px-6 py-4">{formatDate(transaction.close_date)}</td>
    </tr>
  );
};

export const LeaderboardContent: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="text-2xl font-bold mb-4 top-0 py-2">Top Transactions</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Rank
              </th>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Crypto
              </th>
              <th scope="col" className="px-6 py-3">
                Amount
              </th>
              <th scope="col" className="px-6 py-3">
                Profit
              </th>
              <th scope="col" className="px-6 py-3">
                Open Date
              </th>
              <th scope="col" className="px-6 py-3">
                Close Date
              </th>
            </tr>
          </thead>
          <tbody>
            {mockTopTransactions.map((transaction, index) => (
              <LeaderboardEntry
                key={transaction.id}
                transaction={transaction}
                rank={index + 1}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
