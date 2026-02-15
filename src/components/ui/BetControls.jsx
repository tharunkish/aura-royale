import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Minus, Plus, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const BetControls = ({ onBet, loading, disabled }) => {
  const { balance } = useGameStore();
  const [betAmount, setBetAmount] = useState(10);

  const handleBet = () => {
    if (betAmount > balance) return;
    onBet(betAmount);
  };

  const adjustBet = (type) => {
    if (type === 'half') setBetAmount(Math.max(1, Math.floor(betAmount / 2)));
    if (type === 'double') setBetAmount(Math.min(balance, betAmount * 2));
    if (type === 'max') setBetAmount(balance);
  };

  return (
    <div className="w-full max-w-sm bg-card p-6 rounded-2xl border border-white/5 space-y-4">
      <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
        <span>Bet Amount</span>
        <span>Max: {balance}</span>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Coins className="w-5 h-5 text-primary" />
        </div>
        <input 
          type="number" 
          value={betAmount} 
          onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
          className="w-full bg-black/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-xl font-mono font-bold text-white focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={() => adjustBet('half')}
          className="bg-secondary hover:bg-white/5 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          ½
        </button>
        <button 
          onClick={() => adjustBet('double')}
          className="bg-secondary hover:bg-white/5 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          2×
        </button>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleBet}
        disabled={loading || disabled || betAmount <= 0 || betAmount > balance}
        className={cn(
          "w-full py-4 rounded-xl font-bold text-lg uppercase tracking-wider shadow-lg transition-all",
          loading ? "bg-muted cursor-not-allowed" : "bg-primary text-black hover:shadow-primary/25"
        )}
      >
        {loading ? "Rolling..." : "Bet"}
      </motion.button>
    </div>
  );
};

export default BetControls;
