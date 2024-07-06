import { useEffect, useState, useCallback } from "react";
import Stake from "./components/Stake";
import Header from "./components/Header";
import SpinButton from "./components/SpinButton";
import Slots from "./components/Slots";
import WinMessage from "./components/WinMessage";
import PayoutInfo from "./components/PayoutInfo";

interface SpinResponse {
  result: string[];
  action: string;
  winAmount: number;
  newBalance: number;
}

function App() {
  const tg = window.Telegram.WebApp;
  tg.setHeaderColor("#010b20");
  tg.setBackgroundColor("#010b20");
  const [balance, setBalance] = useState(0);
  const [spinResult, setSpinResult] = useState(['🍇', '🍒', '🍇']);
  const [stake, setStake] = useState(1);
  const [spinAction, setSpinAction] = useState<string | null>(null); // 'win' or 'lose'
  const [winAmount, setWinAmount] = useState<number | null>(null);
  const [isSpinInProgress, setIsSpinInProgress] = useState(false);
  const [newBalance, setNewBalance] = useState<number | null>(null);
  const [startSpin, setStartSpin] = useState(false);
  const [spinStatus, setSpinStatus] = useState('initial'); // 'initial', 'spinning', or 'complete'

  const payoutInfo = {
    emojis: ['7️⃣', '🎰', '🍇', '🍒', '🍋'],
    multipliers: [1500, 500, 18, 12, 4]
  }

  useEffect(() => {
    tg.expand();
    fetchBalance();
  }, []);

  const handleSpinComplete = useCallback(() => {
    setSpinStatus('complete');
    if (newBalance !== null) {
      setBalance(newBalance);
      setNewBalance(null);
    }
    if (spinAction === 'win') {
      tg.HapticFeedback.notificationOccurred("error");
    } else if (spinAction === 'lose') {
      tg.HapticFeedback.impactOccurred("soft");
    }
  }, [spinAction, newBalance]);

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
  if (isSpinInProgress) return;

  setIsSpinInProgress(true);

  try {
    const formData = new URLSearchParams();
    formData.append('_auth', window.Telegram.WebApp.initData);
    formData.append('stake', stake.toString());

    const spinResponse = await fetch('/spin', {
      method: 'POST',
      headers: {
        "ngrok-skip-browser-warning": "69420",
      },
      credentials: 'include',
      body: formData,
    });
    const spin: SpinResponse = await spinResponse.json();

    setBalance(balance - stake);
    setSpinStatus('spinning');
    setStartSpin(true);
    setNewBalance(spin.newBalance);
    setSpinResult(spin.result);
    setSpinAction(spin.action);
    setWinAmount(spin.winAmount);
  } catch (error) {
    console.error('Error during spin:', error);
  } finally {
    setIsSpinInProgress(false);
  }
};

  const isSpinDisabled = balance === 0 || balance < stake || isSpinInProgress;

  return (
    <div className="flex flex-col h-screen bg-[#010b20] text-white">
      <Header userName={tg.initDataUnsafe.user?.first_name || 'None'} balance={balance}/>
      <PayoutInfo emojis={payoutInfo.emojis} multipliers={payoutInfo.multipliers} />
      <div className="flex flex-col items-center justify-center">
        <Slots
          startSpin={startSpin}
          setIsSpinInProgress={setIsSpinInProgress}
          onSpinComplete={() => {
            handleSpinComplete();
            setStartSpin(false);
          }}
          spinResult={spinResult} 
          emojis={payoutInfo.emojis}
        />
        <WinMessage spinStatus={spinStatus} spinAction={spinAction || ''} winAmount={winAmount || 0}/>
        <div className="flex justify-between items-stretch w-full px-4">
          <div className="flex items-center">
            <Stake
              stake={stake}
              balance={balance}
              setStake={setStake}
              isSpinDisabled={isSpinDisabled}
            />
          </div>
          <div className="flex items-end">
            <SpinButton postSpin={postSpin} isSpinDisabled={isSpinDisabled} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App;
