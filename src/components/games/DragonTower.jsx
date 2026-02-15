import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Crown, Star } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import useSound from '../../hooks/useSound';

const LEVELS = [
  { multiplier: 1.25, tiles: 3, safe: 2 },
  { multiplier: 1.56, tiles: 3, safe: 2 },
  { multiplier: 1.96, tiles: 3, safe: 2 },
  { multiplier: 2.45, tiles: 3, safe: 2 },
  { multiplier: 3.06, tiles: 3, safe: 2 },
  { multiplier: 3.82, tiles: 3, safe: 2 },
  { multiplier: 4.78, tiles: 3, safe: 2 },
  { multiplier: 5.97, tiles: 3, safe: 2 },
  { multiplier: 7.46, tiles: 3, safe: 2 }, // Boss Level
];

const DragonTower = () => {
  const { balance, subtractBalance, addBalance } = useGameStore();
  const { playClick, playWin, playLoss, playCoin } = useSound();
  const [betAmount, setBetAmount] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRow, setCurrentRow] = useState(0);
  const [revealed, setRevealed] = useState({}); // { '0-1': 'safe', '0-2': 'dragon' }
  const [gameState, setGameState] = useState('idle'); // idle, playing, won, lost

  const startGame = () => {
    if (betAmount > balance || betAmount <= 0) return;
    if (!subtractBalance(betAmount)) return;

    setIsPlaying(true);
    setGameState('playing');
    setCurrentRow(0);
    setRevealed({});
    playClick();
  };

  const selectTile = (colIndex) => {
    if (gameState !== 'playing') return;
    
    // Determine result
    const isSafe = Math.random() > 0.33; // 2/3 chance roughly
    const key = `${currentRow}-${colIndex}`;
    
    setRevealed(prev => ({ ...prev, [key]: isSafe ? 'safe' : 'dragon' }));

    if (!isSafe) {
       setGameState('lost');
       playLoss();
       // Reveal all dragons in current row
    } else {
       playCoin();
       if (currentRow === LEVELS.length - 1) {
          cashOut(true); // Top reached
       } else {
          setCurrentRow(prev => prev + 1);
       }
    }
  };

  const cashOut = (isMaxWin = false) => {
    setIsPlaying(false);
    setGameState('idle');
    const multiplier = LEVELS[currentRow - (isMaxWin ? 0 : 1)]?.multiplier || 1.0;
    // Fix: if cashout at start (row 0), nothing? No, can't cashout before playing.
    if (currentRow === 0 && !isMaxWin) return; // Should be impossible via UI

    const amount = betAmount * multiplier;
    addBalance(amount);
    playWin();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 h-[700px]">
       
       {/* Controls */}
       <div className="bg-card/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col gap-6 shadow-xl h-fit">
          <div className="space-y-4">
             <label className="text-muted-foreground text-sm font-bold uppercase">Bet Amount</label>
             <input 
               type="number" 
               value={betAmount}
               onChange={(e) => setBetAmount(Number(e.target.value))}
               disabled={isPlaying}
               className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-lg font-mono font-bold text-white focus:outline-none focus:border-primary/50 transition-all disabled:opacity-50"
            />
          </div>

          {isPlaying ? (
             <div className="flex flex-col gap-4">
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                   <span className="text-muted-foreground text-xs uppercase">Current Win</span>
                   <span className="text-green-400 font-mono font-bold text-xl">
                      {currentRow > 0 ? formatCurrency(betAmount * LEVELS[currentRow - 1].multiplier) : "$0.00"}
                   </span>
                </div>
                <button 
                  onClick={() => cashOut()} 
                  disabled={currentRow === 0}
                  className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl uppercase tracking-wider disabled:opacity-50"
                >
                   Cash Out
                </button>
             </div>
          ) : (
             <button onClick={startGame} className="w-full py-4 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl uppercase tracking-wider shadow-lg">
                Start Raid
             </button>
          )}
       </div>

       {/* Tower Visual */}
       <div className="lg:col-span-2 bg-black/40 backdrop-blur-md rounded-3xl border border-white/5 p-8 flex flex-col justify-end items-center relative overflow-hidden">
          {/* Background Decor */}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.8),transparent)] pointer-events-none" />
          
          <div className="flex flex-col-reverse gap-2 w-full max-w-sm relative z-10">
             {LEVELS.map((level, rowIndex) => (
                <div 
                  key={rowIndex} 
                  className={cn(
                     "grid grid-cols-3 gap-2 p-2 rounded-xl transition-all duration-300",
                     rowIndex === currentRow && isPlaying ? "bg-white/10 ring-1 ring-white/20 scale-105" : "opacity-50"
                  )}
                >
                   {[0, 1, 2].map(colIndex => {
                      const status = revealed[`${rowIndex}-${colIndex}`];
                      return (
                         <motion.button
                           key={colIndex}
                           whileHover={rowIndex === currentRow && isPlaying && !status ? { scale: 1.05 } : {}}
                           whileTap={rowIndex === currentRow && isPlaying && !status ? { scale: 0.95 } : {}}
                           onClick={() => selectTile(colIndex)}
                           disabled={rowIndex !== currentRow || !isPlaying || !!status}
                           className={cn(
                              "h-12 rounded-lg border flex items-center justify-center transition-all",
                              status === 'safe' ? "bg-green-500 border-green-400 text-black" :
                              status === 'dragon' ? "bg-red-500 border-red-400 text-black" :
                              "bg-black/40 border-white/10 hover:border-white/30"
                           )}
                        >
                           <AnimatePresence mode="wait">
                              {status === 'safe' && (
                                 <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                    <Star className="w-6 h-6 fill-current" />
                                 </motion.div>
                              )}
                              {status === 'dragon' && (
                                 <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                    <Skull className="w-6 h-6 fill-current" />
                                 </motion.div>
                              )}
                              {!status && rowIndex === currentRow && (
                                 <div className="w-2 h-2 rounded-full bg-white/20" />
                              )}
                           </AnimatePresence>
                        </motion.button>
                      );
                   })}
                   
                   {/* Multiplier Label */}
                   <div className="absolute right-[-60px] top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-primary">
                      {level.multiplier}x
                   </div>
                </div>
             ))}
          </div>
       </div>

    </div>
  );
};

export default DragonTower;
