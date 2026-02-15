import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import useSound from '../../hooks/useSound';

const GEM_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7']; // Red, Blue, Green, Yellow, Purple

const Diamonds = () => {
  const { balance, subtractBalance, addBalance } = useGameStore();
  const { playClick, playWin, playCoin } = useSound();
  const [betAmount, setBetAmount] = useState(10);
  const [gems, setGems] = useState(Array(5).fill(null));
  const [isSpinning, setIsSpinning] = useState(false);
  const [payout, setPayout] = useState(0);

  const spin = async () => {
    if (betAmount > balance || betAmount <= 0) return;
    if (!subtractBalance(betAmount)) return;

    setIsSpinning(true);
    setPayout(0);
    setGems(Array(5).fill(null)); // Clear
    playClick();

    // Reveal one by one
    const newGems = [];
    for (let i = 0; i < 5; i++) {
       await new Promise(r => setTimeout(r, 150)); // Sequential reveal
       const color = GEM_COLORS[Math.floor(Math.random() * GEM_COLORS.length)];
       newGems.push(color);
       setGems([...newGems, ...Array(5 - newGems.length).fill(null)]);
       playCoin();
    }

    setIsSpinning(false);
    calculateWin(newGems);
  };

  const calculateWin = (resultGems) => {
     // Count occurrences
     const counts = {};
     resultGems.forEach(c => counts[c] = (counts[c] || 0) + 1);
     
     // Determine Payout
     // 5 of a kind: 50x
     // 4 of a kind: 10x
     // 3 of a kind: 3x
     // 2 pair: 2x
     // Full House (3+2): 20x (Optional complex rule, let's stick to counts)
     
     let mult = 0;
     const maxCount = Math.max(...Object.values(counts));
     const pairCount = Object.values(counts).filter(c => c === 2).length;
     
     if (maxCount === 5) mult = 50;
     else if (maxCount === 4) mult = 10;
     else if (maxCount === 3 && pairCount === 1) mult = 5; // Full House ish
     else if (maxCount === 3) mult = 3;
     else if (pairCount === 2) mult = 2;
     
     if (mult > 0) {
        addBalance(betAmount * mult);
        setPayout(betAmount * mult);
        playWin();
     }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 flex flex-col items-center gap-12 h-[600px] justify-center">
       
       {/* Gem Grid */}
       <div className="flex gap-4 perspective-1000">
          {Array.from({ length: 5 }).map((_, i) => (
             <div 
               key={i} 
               className="w-20 h-20 md:w-24 md:h-24 bg-black/40 rounded-xl border border-white/10 flex items-center justify-center relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
             >
                <AnimatePresence mode="wait">
                   {gems[i] && (
                      <motion.div
                        initial={{ scale: 0, rotateY: 180 }}
                        animate={{ scale: 1, rotateY: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="relative"
                      >
                         <Gem 
                           className="w-12 h-12 md:w-16 md:h-16 drop-shadow-[0_0_15px_currentColor]" 
                           style={{ color: gems[i], fill: `${gems[i]}20` }} 
                         />
                         <div className="absolute inset-0 bg-white/50 blur-xl opacity-20" style={{ backgroundColor: gems[i] }} />
                      </motion.div>
                   )}
                </AnimatePresence>
             </div>
          ))}
       </div>

       {/* Payout Display */}
       <div className="h-16 flex items-center justify-center">
          <AnimatePresence>
             {payout > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="text-4xl font-display font-black text-green-400 drop-shadow-2xl"
                >
                   +{formatCurrency(payout)}
                </motion.div>
             )}
          </AnimatePresence>
       </div>

       {/* Controls */}
       <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="relative">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
             <input 
               type="number" 
               value={betAmount}
               onChange={(e) => setBetAmount(Number(e.target.value))}
               disabled={isSpinning}
               className="w-40 bg-black/60 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-lg font-mono font-bold text-white focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
          <button 
            onClick={spin} 
            disabled={isSpinning}
            className="px-8 py-3 bg-primary hover:bg-primary/90 text-black font-bold text-lg rounded-xl uppercase tracking-wider shadow-lg transition-transform active:scale-95 disabled:opacity-50"
          >
             {isSpinning ? "..." : "Spin"}
          </button>
       </div>

    </div>
  );
};

export default Diamonds;
