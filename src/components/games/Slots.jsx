import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Play, RefreshCw } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import confetti from 'canvas-confetti';

const SYMBOLS = [
  { id: 'cherry', icon: '🍒', value: 2 },
  { id: 'lemon', icon: '🍋', value: 3 },
  { id: 'orange', icon: '🍊', value: 4 },
  { id: 'plum', icon: '🫐', value: 5 },
  { id: 'bell', icon: '🔔', value: 10 },
  { id: 'bar', icon: '🍫', value: 20 },
  { id: 'seven', icon: '7️⃣', value: 50 },
  { id: 'diamond', icon: '💎', value: 100 },
];

const REELS = 5;
const ROWS = 3;

const Slots = () => {
  const { balance, subtractBalance, addBalance } = useGameStore();
  const [betAmount, setBetAmount] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState(Array.from({ length: REELS }, () => Array(ROWS).fill(SYMBOLS[0])));
  const [winLines, setWinLines] = useState([]);
  const [payout, setPayout] = useState(0);

  const spin = async () => {
    if (betAmount > balance || betAmount <= 0) return;
    if (!subtractBalance(betAmount)) return;

    setIsSpinning(true);
    setWinLines([]);
    setPayout(0);

    // Simulate Reel Spin
    const spinDuration = 2000;
    const intervalTime = 100;
    const spins = spinDuration / intervalTime;
    
    let currentSpin = 0;
    const spinInterval = setInterval(() => {
       setReels(prev => prev.map(() => 
          Array.from({ length: ROWS }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
       ));
       currentSpin++;
       if (currentSpin >= spins) {
          clearInterval(spinInterval);
          finalizeSpin();
       }
    }, intervalTime);
  };

  const finalizeSpin = () => {
    // Determine Final Symbols
    const finalReels = Array.from({ length: REELS }, () => 
       Array.from({ length: ROWS }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
    );
    setReels(finalReels);
    setIsSpinning(false);

    // Check Wins (Simplified: Match 3+ in a row horizontally)
    let totalWin = 0;
    const newWinLines = [];

    // Check Rows
    for (let row = 0; row < ROWS; row++) {
       let matchCount = 1;
       let currentSymbol = finalReels[0][row];
       
       for (let col = 1; col < REELS; col++) {
          if (finalReels[col][row].id === currentSymbol.id) {
             matchCount++;
          } else {
             break;
          }
       }

       if (matchCount >= 3) {
          const win = betAmount * currentSymbol.value * (matchCount - 2);
          totalWin += win;
          newWinLines.push({ row, count: matchCount });
       }
    }

    if (totalWin > 0) {
       addBalance(totalWin);
       setPayout(totalWin);
       setWinLines(newWinLines);
       confetti({
          particleCount: 100 * (totalWin / betAmount),
          spread: 70,
          origin: { y: 0.6 }
       });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 flex flex-col items-center gap-8">
       
       {/* Slot Machine Display */}
       <div className="bg-gradient-to-b from-gray-800 to-black p-8 rounded-[40px] border-4 border-yellow-600 shadow-[0_0_50px_rgba(255,215,0,0.2)] relative">
          
          {/* Logo */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black px-6 py-2 rounded-full border-2 border-yellow-500 shadow-lg z-20">
             <h1 className="text-2xl font-display font-bold text-yellow-400 tracking-widest drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]">NEON SLOTS</h1>
          </div>

          <div className="flex gap-2 bg-black/50 p-4 rounded-2xl border-2 border-yellow-900/50 shadow-inner overflow-hidden relative">
             {/* Win Line Indicators */}
             {winLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  className="absolute left-0 h-1 bg-yellow-400 z-10 shadow-[0_0_10px_currentColor]"
                  style={{ top: `${(line.row * 33) + 16}%` }}
                />
             ))}

             {reels.map((reel, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-2 relative w-24">
                   <AnimatePresence mode="popLayout">
                   {reel.map((symbol, rowIndex) => (
                      <motion.div
                        key={`${colIndex}-${rowIndex}-${isSpinning ? Math.random() : 'static'}`}
                        initial={isSpinning ? { y: -100, opacity: 0, filter: 'blur(10px)' } : {}}
                        animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                        exit={isSpinning ? { y: 100, opacity: 0, filter: 'blur(10px)' } : {}}
                        className={cn(
                           "h-24 bg-gradient-to-b from-gray-700 to-gray-900 rounded-lg border border-white/10 flex items-center justify-center text-4xl shadow-inner",
                           winLines.some(l => l.row === rowIndex && colIndex < l.count) && "border-yellow-400 shadow-[inset_0_0_20px_rgba(255,215,0,0.4)] bg-yellow-900/20"
                        )}
                      >
                         {symbol.icon}
                      </motion.div>
                   ))}
                   </AnimatePresence>
                   {/* Blur overlay for spinning effect */}
                   {isSpinning && (
                      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 z-20 pointer-events-none backdrop-blur-[2px]" />
                   )}
                </div>
             ))}
          </div>

          {/* Payline Info */}
          <div className="mt-4 flex justify-between items-center text-xs text-yellow-600/50 font-mono uppercase tracking-widest px-2">
             <span>20 Lines</span>
             <span>Pays Left to Right</span>
          </div>

       </div>

       {/* Controls */}
       <div className="flex flex-col items-center gap-4 w-full max-w-md">
          
          <div className="flex justify-between w-full bg-black/40 p-4 rounded-xl border border-white/10">
             <div className="text-left">
                <div className="text-xs text-muted-foreground uppercase font-bold">Balance</div>
                <div className="text-xl font-mono text-white">{formatCurrency(balance)}</div>
             </div>
             <div className="text-right">
                <div className="text-xs text-muted-foreground uppercase font-bold">Last Win</div>
                <div className="text-xl font-mono text-green-400">+{formatCurrency(payout)}</div>
             </div>
          </div>

          <div className="flex gap-4 w-full">
             <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input 
                  type="number" 
                  value={betAmount} 
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  disabled={isSpinning}
                  className="w-full h-14 bg-black/40 border border-white/10 rounded-xl pl-8 pr-4 text-xl font-bold text-white focus:outline-none focus:border-yellow-500 transition-colors disabled:opacity-50"
                />
             </div>
             <button 
               onClick={spin}
               disabled={isSpinning}
               className="flex-1 bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-bold text-xl uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 transition-all flex items-center justify-center gap-2"
             >
                {isSpinning ? <RefreshCw className="animate-spin w-6 h-6" /> : "SPIN"}
             </button>
          </div>

       </div>

    </div>
  );
};

export default Slots;
