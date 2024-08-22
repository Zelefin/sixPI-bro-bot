export interface CoinInfo {
    id: number;
    name: string;
    symbol: string;
    price: number;
    change24h: number;
  }

export interface Transaction {
    id: number;
    full_name: string;
    coin_id: number;
    coin_symbol: string;
    amount: number;
    points_spent: number;
    buy_price: number;
    sell_price: number | null;
    profit: number | null;
    open_date: string;
    close_date: string | null;
    estimated_sell_price: number | null;
    estimated_profit: number | null;
  }


export interface UserTransactions {
  open_transactions: Transaction[];
  closed_transactions: Transaction[];
}