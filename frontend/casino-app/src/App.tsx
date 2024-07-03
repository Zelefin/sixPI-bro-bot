import { useEffect, useState } from "react";

interface SpinResponse {
  result: string[];
  action: string;
  winAmount: number;
  newBalance: number;
}

function App() {

  const tg = window.Telegram.WebApp;
  const [balance, setBalance] = useState(0);
  const [result, setResult] = useState(['🍇', '🍒', '🍇']);


  useEffect(() => {
    tg.expand();
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    const userId = window.Telegram.WebApp.initDataUnsafe.user?.id;
    const balanceResponse = await fetch(`/balance?user_id=${userId}`, {
      method: 'GET',
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
      credentials: 'include',
    });
    const balance = await balanceResponse.json();
    setBalance(balance.balance);
  };

  const postSpin = async () => {
    const formData = new URLSearchParams();
    formData.append('_auth', window.Telegram.WebApp.initData);
    formData.append('stake', '1');

    const spinResponse = await fetch('/spin', {
      method: 'POST',
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
      credentials: 'include',
      body: formData,
    });
    const spin: SpinResponse = await spinResponse.json();

    setBalance(spin.newBalance);
    setResult(spin.result);
  };

  return (
    <>
      <div>
        <p className="text-3xl font-bold underline text-white">Wassap bro!</p>
        <p className="text-2xl font-bold underline text-white">You're balance {balance}</p>
      </div>
      <div className="flex items-center justify-center">
        <button onClick={postSpin} className="text-2xl font-bold text-emerald-500">Spin</button>
      </div>
      <p className="mt-5 text-2xl justify-center flex font-bold">{result}</p>
    </>
  )
}

export default App

