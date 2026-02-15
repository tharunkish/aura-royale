import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import useSound from '../../hooks/useSound';

const MULTIPLIERS = [1.00, 1.50, 2.00, 3.00, 5.00, 10.00, 0.00, 20.00, 50.00];

const Slide = () => {
  const { balance, subtractBalance, addBalance } = useGameStore();
  const { playClick, playWin, playLoss, playCoin } = useSound();
  const [betAmount, setBetAmount] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [offset, setOffset] = useState(0);
  const [result, setResult] = useState(null);
  
  const containerRef = useRef(null);

  const spin = async () => {
    if (betAmount > balance || betAmount <= 0) return;
    if (!subtractBalance(betAmount)) return;

    setIsPlaying(true);
    setResult(null);
    playClick();

    // Determine Result
    const outcomeIndex = Math.floor(Math.random() * MULTIPLIERS.length);
    const multiplier = MULTIPLIERS[outcomeIndex];
    
    // Animation Logic: Infinite slide visual
    // We slide a huge amount then settle on the index
    // Width of card approx 120px + gap 16px = 136px
    const cardWidth = 136;
    const centerOffset = containerRef.current ? containerRef.current.offsetWidth / 2 - cardWidth / 2 : 0;
    
    // Random spins
    const spins = 30;
    const finalPosition = -(spins * MULTIPLIERS.length * cardWidth) - (outcomeIndex * cardWidth) + centerOffset;
    
    setOffset(finalPosition);

    await new Promise(r => setTimeout(r, 4000)); // CSS transition duration

    setIsPlaying(false);
    if (multiplier > 0) {
       addBalance(betAmount * multiplier);
       playWin();
       setResult(multiplier);
    } else {
       playLoss();
       setResult(0);
    }
  };

  // Generate a long strip for sliding
  const strip = [...Array(50).fill(MULTIPLIERS).flat()];

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col gap-12 h-[600px] justify-center items-center">
       
       {/* Slider Window */}
       <div className="w-full max-w-4xl h-48 bg-black/40 border-y-4 border-primary/50 relative overflow-hidden flex items-center shadow-[inset_0_0_50px_black]">
          {/* Center Marker */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-yellow-500 z-20 shadow-[0_0_15px_yellow]" />
          <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-4 h-4 bg-yellow-500 rotate-45 z-20" />
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-yellow-500 rotate-45 z-20" />

          {/* Moving Strip */}
          <div 
            ref={containerRef}
            className="flex gap-4 absolute left-0 transition-transform duration-[4000ms] cubic-bezier(0.1, 0, 0.2, 1)"
            style={{ transform: `translateX(${offset}px)` }}
          >
             {strip.map((m, i) => (
                <div 
                  key={i} 
                  className={cn(
                     "w-32 h-32 rounded-xl flex items-center justify-center text-3xl font-black shrink-0 border-2",
                     m === 0 ? "bg-gray-800 border-gray-600 text-gray-500" :
                     m >= 10 ? "bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.2)]" :
                     m >= 2 ? "bg-green-500/20 border-green-500 text-green-400" :
                     "bg-blue-500/20 border-blue-500 text-blue-400"
                  )}
                >
                   {m}x
                </div>
             ))}
          </div>
       </div>

       {/* Result Display */}
       <div className="h-16">
          <AnimatePresence>
             {result !== null && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={cn("text-4xl font-display font-black", result > 0 ? "text-green-400" : "text-gray-500")}
                >
                   {result > 0 ? `You Won ${formatCurrency(betAmount * result)}` : "Try Again"}
                </motion.div>
             )}
          </AnimatePresence>
       </div>

       {/* Controls */}
       <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/10 backdrop-blur-md w-full max-w-lg">
          <div className="relative flex-1">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
             <input 
               type="number" 
               value={betAmount}
               onChange={(e) => setBetAmount(Number(e.target.value))}
               disabled={isPlaying}
               className="w-full bg-black/60 border border-white/10 rounded-xl py-4 pl-8 pr-4 text-xl font-mono font-bold text-white focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
          <button 
            onClick={spin} 
            disabled={isPlaying}
            className="px-12 py-4 bg-primary hover:bg-primary/90 text-black font-bold text-xl rounded-xl uppercase tracking-wider shadow-lg transition-transform active:scale-95 disabled:opacity-50"
          >
             {isPlaying ? "Sliding..." : "Slide"}
          </button>
       </div>

    </div>
  );
};

export default Slide;
