import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCurrency } from '../../lib/utils';

const GRID_NUMBERS = 40;
const DRAW_COUNT = 10;

const PAYOUTS = {
  1: [0, 3.8],
  2: [0, 1.7, 5.2],
  3: [0, 0, 1.5, 25],
  4: [0, 0, 1, 4, 80],
  5: [0, 0, 0, 2, 12, 300],
  6: [0, 0, 0, 1, 5, 50, 600],
  7: [0, 0, 0, 0, 2, 15, 150, 800],
  8: [0, 0, 0, 0, 0, 5, 50, 300, 1000],
  9: [0, 0, 0, 0, 0, 0, 10, 100, 500, 2000],
  10: [0, 0, 0, 0, 0, 0, 5, 40, 200, 1000, 5000]
};

const Keno = () => {
  const { balance, subtractBalance, addBalance } = useGameStore();
  const [selected, setSelected] = useState([]);
  const [drawn, setDrawn] = useState([]);
  const [betAmount, setBetAmount] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  const toggleNumber = (num) => {
    if (isPlaying) return;
    if (selected.includes(num)) {
      setSelected(selected.filter(n => n !== num));
    } else {
      if (selected.length < 10) {
        setSelected([...selected, num]);
      }
    }
  };

  const playGame = async () => {
    if (selected.length === 0) return;
    if (betAmount > balance) return;
    if (!subtractBalance(betAmount)) return;

    setIsPlaying(true);
    setDrawn([]);
    setGameResult(null);

    // Simulate Draw
    const newDrawn = [];
    const available = Array.from({ length: GRID_NUMBERS }, (_, i) => i + 1);
    
    // Draw logic with delay
    for (let i = 0; i < DRAW_COUNT; i++) {
       await new Promise(r => setTimeout(r, 200));
       const idx = Math.floor(Math.random() * available.length);
       const num = available.splice(idx, 1)[0];
       newDrawn.push(num);
       setDrawn([...newDrawn]);
    }

    // Calculate Win
    const matches = selected.filter(n => newDrawn.includes(n)).length;
    const payoutTable = PAYOUTS[selected.length] || [];
    const multiplier = payoutTable[matches] || 0;
    const winAmount = betAmount * multiplier;

    if (winAmount > 0) {
       addBalance(winAmount);
    }
    
    setGameResult({ matches, winAmount });
    setIsPlaying(false);
  };

  const clearSelection = () => {
    if (!isPlaying) setSelected([]);
  };

  const randomPick = () => {
    if (isPlaying) return;
    const count = 10;
    const newSelected = [];
    const available = Array.from({ length: GRID_NUMBERS }, (_, i) => i + 1);
    for (let i = 0; i < count; i++) {
       const idx = Math.floor(Math.random() * available.length);
       newSelected.push(available.splice(idx, 1)[0]);
    }
    setSelected(newSelected);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
      
      {/* Controls */}
      <div className="bg-card/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col gap-6 shadow-xl h-fit">
         <div className="space-y-4">
             <label className="text-muted-foreground text-sm font-bold uppercase">Bet Amount</label>
             <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input 
                  type="number" 
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  disabled={isPlaying}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-lg font-mono font-bold text-white focus:outline-none focus:border-primary/50 transition-all disabled:opacity-50"
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button onClick={randomPick} disabled={isPlaying} className="py-3 bg-secondary rounded-lg font-bold text-sm hover:bg-white/5 disabled:opacity-50">Random Pick</button>
             <button onClick={clearSelection} disabled={isPlaying} className="py-3 bg-secondary rounded-lg font-bold text-sm hover:bg-white/5 disabled:opacity-50">Clear</button>
          </div>

          <button
             onClick={playGame}
             disabled={isPlaying || selected.length === 0}
             className="w-full py-4 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl text-lg uppercase tracking-wider shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isPlaying ? "Drawing..." : "Bet"}
           </button>
           
           {/* Payout Table */}
           <div className="mt-4 bg-black/40 rounded-xl p-4 border border-white/5">
              <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Payouts ({selected.length} Selected)</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                 {(PAYOUTS[selected.length] || []).map((mult, i) => (
                    <div key={i} className={cn("flex justify-between px-2 py-1 rounded", i === gameResult?.matches ? "bg-primary text-black font-bold" : "text-muted-foreground")}>
                       <span>{i}x</span>
                       <span>{mult}x</span>
                    </div>
                 ))}
              </div>
           </div>
      </div>

      {/* Grid */}
      <div className="lg:col-span-2 bg-black/40 backdrop-blur-md rounded-3xl border border-white/5 p-8 flex flex-col items-center justify-center relative shadow-2xl">
         <div className="grid grid-cols-8 gap-3 w-full max-w-[600px]">
            {Array.from({ length: GRID_NUMBERS }, (_, i) => i + 1).map((num) => {
               const isSelected = selected.includes(num);
               const isDrawn = drawn.includes(num);
               const isMatch = isSelected && isDrawn;
               
               return (
                  <motion.button
                    key={num}
                    whileHover={!isPlaying ? { scale: 1.1 } : {}}
                    whileTap={!isPlaying ? { scale: 0.9 } : {}}
                    onClick={() => toggleNumber(num)}
                    disabled={isPlaying}
                    className={cn(
                      "aspect-square rounded-lg font-bold text-lg flex items-center justify-center transition-all duration-300 relative overflow-hidden",
                      isMatch 
                        ? "bg-primary text-black shadow-[0_0_15px_rgba(255,215,0,0.6)] z-10 scale-110" 
                        : isDrawn 
                          ? "bg-secondary text-white border border-white/20"
                          : isSelected 
                            ? "bg-white/10 text-white border border-primary/50"
                            : "bg-card/50 text-muted-foreground hover:bg-white/5"
                    )}
                  >
                     {num}
                     {isMatch && <motion.div layoutId="match-glow" className="absolute inset-0 bg-white/50 animate-pulse" />}
                  </motion.button>
               );
            })}
         </div>
         
         {gameResult && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="absolute bottom-8 bg-black/80 backdrop-blur-xl px-8 py-4 rounded-2xl border border-primary/30 text-center"
            >
               <div className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Result</div>
               <div className={cn("text-3xl font-display font-bold", gameResult.winAmount > 0 ? "text-green-400" : "text-white")}>
                  {gameResult.winAmount > 0 ? `+${formatCurrency(gameResult.winAmount)}` : "0.00"}
               </div>
            </motion.div>
         )}
      </div>

    </div>
  );
};

export default Keno;
