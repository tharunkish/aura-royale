import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Rocket } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import useSound from '../../hooks/useSound';

const Limbo = () => {
  const { balance, subtractBalance, addBalance } = useGameStore();
  const { playClick, playWin, playLoss } = useSound();
  const [target, setTarget] = useState(2.00);
  const [betAmount, setBetAmount] = useState(10);
  const [result, setResult] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const winChance = (99 / target).toFixed(2);
  const potentialWin = betAmount * target;

  const play = async () => {
    if (betAmount > balance || betAmount <= 0) return;
    if (!subtractBalance(betAmount)) return;

    setIsPlaying(true);
    setResult(null);
    playClick();

    // Simulate Network Delay for suspense
    await new Promise(r => setTimeout(r, 300));

    // Generate Outcome (0 to 1,000,000)
    // Formula: 100 / (1 - r) * 0.99
    // But Limbo usually just needs to beat target.
    // Let's use standard crash-like distribution.
    const r = Math.random();
    const outcome = Math.max(1.00, (0.99 / (1 - r)));
    
    // Animate numbers
    let current = 1.00;
    const end = outcome > 100 ? 100 : outcome; // Visual cap for speed
    const step = (end - 1) / 20;
    
    const interval = setInterval(() => {
       current += step;
       if (current >= outcome) {
          clearInterval(interval);
          finalize(outcome);
       } else {
          // Just visual updates
       }
    }, 20);

    // Fast finish for code simplicity in this engine
    setTimeout(() => {
       clearInterval(interval);
       finalize(outcome);
    }, 500);
  };

  const finalize = (outcome) => {
     setIsPlaying(false);
     setResult(outcome);
     
     if (outcome >= target) {
        addBalance(betAmount * target);
        playWin();
     } else {
        playLoss();
     }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 h-[500px]">
       
       {/* Controls */}
       <div className="bg-card/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col gap-6 shadow-xl h-fit">
          <div className="space-y-4">
             <label className="text-muted-foreground text-sm font-bold uppercase">Target Multiplier</label>
             <div className="relative">
                <input 
                  type="number" 
                  value={target}
                  onChange={(e) => setTarget(Math.max(1.01, Number(e.target.value)))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-lg font-mono font-bold text-white focus:outline-none focus:border-primary/50 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">x</span>
             </div>
             
             <div className="flex justify-between text-xs font-bold uppercase text-muted-foreground">
                <span>Win Chance: <span className="text-white">{winChance}%</span></span>
             </div>
          </div>

          <div className="space-y-4">
             <label className="text-muted-foreground text-sm font-bold uppercase">Bet Amount</label>
             <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input 
                  type="number" 
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-lg font-mono font-bold text-white focus:outline-none focus:border-primary/50 transition-all"
                />
             </div>
          </div>

          <button
            onClick={play}
            disabled={isPlaying}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl text-lg uppercase tracking-wider shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
          >
             {isPlaying ? "Launching..." : "Bet"}
          </button>
       </div>

       {/* Game Display */}
       <div className="lg:col-span-2 bg-black/40 backdrop-blur-md rounded-3xl border border-white/5 p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary),0.1),transparent_70%)]" />
          
          <div className="relative z-10 text-center">
             <div className="text-2xl font-bold uppercase tracking-[0.5em] text-muted-foreground mb-4">Payout</div>
             <motion.div 
               key={result}
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className={cn(
                  "text-8xl md:text-9xl font-display font-black tracking-tighter tabular-nums",
                  result >= target ? "text-green-400 drop-shadow-[0_0_30px_rgba(34,197,94,0.5)]" : "text-red-500"
               )}
             >
                {result ? result.toFixed(2) : "0.00"}
                <span className="text-4xl text-muted-foreground ml-2">x</span>
             </motion.div>
             
             {result && (
                <div className="mt-4 text-xl font-bold text-white">
                   Target: {target.toFixed(2)}x
                </div>
             )}
          </div>
       </div>

    </div>
  );
};

export default Limbo;
