import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { clsx } from 'clsx';
import useSound from '../../hooks/useSound';

const Dice = () => {
  const { balance, addBalance, subtractBalance } = useGameStore();
  const { playClick, playWin, playLoss, playHover } = useSound();
  const [target, setTarget] = useState(50); // 0-100
  const [betAmount, setBetAmount] = useState(10);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState(null); // { number: 50.00, won: true/false }
  const [multiplier, setMultiplier] = useState(2.00);
  const [winChance, setWinChance] = useState(50.00);

  useEffect(() => {
    const chance = 100 - target;
    setWinChance(chance);
    setMultiplier((99 / chance).toFixed(4));
  }, [target]);

  const handleRoll = async () => {
    if (betAmount > balance) return;
    if (betAmount <= 0) return;

    if (!subtractBalance(betAmount)) return;
    setIsRolling(true);
    setResult(null);
    playClick(); // Rolling sound start

    // Roll Logic
    const rollDuration = 600; // ms
    
    const interval = setInterval(() => {
      setResult({ number: (Math.random() * 100).toFixed(2), won: false, interim: true });
    }, 50);

    setTimeout(() => {
      clearInterval(interval);
      const finalRoll = (Math.random() * 100).toFixed(2);
      const won = parseFloat(finalRoll) > target;
      
      setResult({ number: finalRoll, won, interim: false });
      setIsRolling(false);

      if (won) {
        const winAmount = betAmount * multiplier;
        addBalance(winAmount);
        playWin();
      } else {
        playLoss();
      }

    }, rollDuration);
  };

  const sliderRef = useRef(null);

  const handleSliderChange = (e) => {
    setTarget(Number(e.target.value));
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
      
      {/* Controls Panel */}
      <div className="bg-card/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 lg:col-span-1 flex flex-col gap-6 shadow-xl">
        <div>
          <label className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-2 block">Bet Amount</label>
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <input 
              type="number" 
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-8 pr-4 text-xl font-mono font-bold text-white focus:outline-none focus:border-primary/50 transition-all shadow-inner"
            />
             <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
               <button onClick={() => { setBetAmount(Math.floor(betAmount / 2)); playHover(); }} className="px-2 py-1 bg-white/5 rounded text-xs hover:bg-white/10 transition-colors">½</button>
               <button onClick={() => { setBetAmount(betAmount * 2); playHover(); }} className="px-2 py-1 bg-white/5 rounded text-xs hover:bg-white/10 transition-colors">2×</button>
               <button onClick={() => { setBetAmount(balance); playHover(); }} className="px-2 py-1 bg-white/5 rounded text-xs hover:bg-white/10 transition-colors">MAX</button>
             </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2 text-sm font-bold text-muted-foreground uppercase tracking-wider">
            <span>Win Chance</span>
            <span className="text-white">{winChance.toFixed(2)}%</span>
          </div>
          <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex justify-between items-center">
             <span className="text-muted-foreground text-xs">Multiplier</span>
             <span className="text-2xl font-bold text-primary font-mono">{multiplier}x</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(255, 215, 0, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRoll}
          disabled={isRolling}
          className={clsx(
            "mt-auto py-5 rounded-xl font-bold text-xl uppercase tracking-widest shadow-lg transition-all relative overflow-hidden group",
            isRolling ? "bg-muted cursor-not-allowed text-muted-foreground" : "bg-primary text-black"
          )}
        >
          {isRolling ? (
             <span className="flex items-center justify-center gap-2">
               <RefreshCw className="animate-spin w-5 h-5" /> Rolling...
             </span>
          ) : (
             <span className="relative z-10">Roll Dice</span>
          )}
          {!isRolling && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />}
        </motion.button>
      </div>

      {/* Game Visualizer */}
      <div className="lg:col-span-2 bg-black/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 flex flex-col justify-center items-center relative overflow-hidden shadow-2xl">
        
        {/* Result Display */}
        <div className="relative mb-12 w-full flex justify-center items-center h-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={result ? result.number : "idle"}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={clsx(
                "text-7xl md:text-9xl font-display font-bold tracking-tighter drop-shadow-2xl",
                result?.won ? "text-green-500 drop-shadow-[0_0_30px_rgba(34,197,94,0.6)]" : 
                result?.interim ? "text-white/50" :
                result ? "text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]" : "text-white/20"
              )}
            >
              {result ? result.number : "00.00"}
            </motion.div>
          </AnimatePresence>
          
          {/* Win/Loss Badge */}
          {result && !result.interim && (
             <motion.div
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className={clsx(
                 "absolute -bottom-8 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider",
                 result.won ? "bg-green-500/20 text-green-400 border border-green-500/50" : "bg-red-500/20 text-red-400 border border-red-500/50"
               )}
             >
               {result.won ? `You Won ${formatCurrency(betAmount * multiplier)}` : "You Lost"}
             </motion.div>
          )}
        </div>

        {/* Slider Visual */}
        <div className="w-full relative h-16 bg-muted/30 rounded-full border border-white/5 overflow-hidden group">
          {/* Progress Bar (Green Zone) */}
          <motion.div 
            className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-green-500/80 to-green-600/20"
            style={{ width: `${100 - target}%` }}
            animate={{ width: `${100 - target}%` }}
          />

          {/* Loss Zone (Red Zone) */}
           <motion.div 
            className="absolute left-0 top-0 bottom-0 bg-red-500/5"
            style={{ width: `${target}%` }}
            animate={{ width: `${target}%` }}
          />

          {/* Slider Input */}
          <input
            ref={sliderRef}
            type="range"
            min="2"
            max="98"
            step="1"
            value={target}
            onInput={() => playHover()}
            onChange={handleSliderChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
          />

          {/* Handle */}
          <motion.div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-10 pointer-events-none"
            style={{ left: `${target}%` }}
            animate={{ left: `${target}%` }}
          >
             <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-12 bg-white rounded-lg shadow-xl flex items-center justify-center">
                <div className="w-1 h-6 bg-black/20 rounded-full" />
             </div>
             <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/10 px-2 py-1 rounded text-xs font-bold backdrop-blur-md">
                {target}
             </div>
          </motion.div>
          
          {/* Result Marker */}
          {result && !result.interim && (
             <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1, left: `${result.number}%` }}
               className={clsx(
                  "absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-[0_0_10px_currentColor] z-30",
                  result.won ? "bg-green-500 text-green-500" : "bg-red-500 text-red-500"
               )}
             />
          )}

        </div>

        <div className="flex justify-between w-full mt-4 px-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
           <span>0</span>
           <span>25</span>
           <span>50</span>
           <span>75</span>
           <span>100</span>
        </div>

      </div>

    </div>
  );
};

export default Dice;
