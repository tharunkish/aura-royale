import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Bomb, Diamond, Ban } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import confetti from 'canvas-confetti';
import useSound from '../../hooks/useSound';

const GRID_SIZE = 25;

const Mines = () => {
  const { balance, subtractBalance, addBalance } = useGameStore();
  const { playClick, playCoin, playLoss, playWin } = useSound();
  const [mineCount, setMineCount] = useState(3);
  const [betAmount, setBetAmount] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [grid, setGrid] = useState(Array.from({ length: GRID_SIZE }, (_, i) => ({ id: i, revealed: false, isMine: false })));
  const [gameOver, setGameOver] = useState(false);
  const [winMultiplier, setWinMultiplier] = useState(1.0);
  const [nextMultiplier, setNextMultiplier] = useState(1.0);
  const [profit, setProfit] = useState(0);

  // Probability Engine
  const calculateMultiplier = (mines, diamondsFound) => {
    let mult = 0.99;
    for (let i = 0; i < diamondsFound; i++) {
        mult *= (25 - i) / (25 - mines - i);
    }
    return mult;
  };

  const startGame = () => {
    if (betAmount > balance || betAmount <= 0) return;
    if (!subtractBalance(betAmount)) return;

    // Generate Mines
    const newGrid = Array(GRID_SIZE).fill(null).map((_, i) => ({ id: i, revealed: false, isMine: false }));
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
      const idx = Math.floor(Math.random() * GRID_SIZE);
      if (!newGrid[idx].isMine) {
        newGrid[idx].isMine = true;
        minesPlaced++;
      }
    }

    setGrid(newGrid);
    setIsPlaying(true);
    setGameOver(false);
    setWinMultiplier(1.0);
    setNextMultiplier(calculateMultiplier(mineCount, 1));
    setProfit(0);
    playClick();
  };

  const handleTileClick = (index) => {
    if (!isPlaying || gameOver || grid[index].revealed) return;

    const tile = grid[index];
    const newGrid = [...grid];
    newGrid[index] = { ...tile, revealed: true };
    setGrid(newGrid);

    if (tile.isMine) {
      // BOOM
      setGameOver(true);
      setIsPlaying(false);
      setProfit(0);
      playLoss();
      // Reveal all mines
      setGrid(newGrid.map(t => ({ ...t, revealed: true })));
    } else {
      // SAFE
      const diamondsFound = newGrid.filter(t => t.revealed && !t.isMine).length;
      const currentMult = calculateMultiplier(mineCount, diamondsFound);
      const nextMult = calculateMultiplier(mineCount, diamondsFound + 1);
      
      setWinMultiplier(currentMult);
      setNextMultiplier(nextMult);
      setProfit(betAmount * currentMult);
      playCoin(); // Gem sound
      
      // Auto-win if all diamonds found
      if (diamondsFound === GRID_SIZE - mineCount) {
        cashOut(currentMult);
      }
    }
  };

  const cashOut = (finalMult = winMultiplier) => {
    setIsPlaying(false);
    setGameOver(true); // Technically game over but won
    const winAmount = betAmount * finalMult;
    addBalance(winAmount);
    setProfit(winAmount); // For display
    playWin();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
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

          <div className="space-y-4">
             <label className="text-muted-foreground text-sm font-bold uppercase">Mines</label>
             <div className="grid grid-cols-4 gap-2">
                {[1, 3, 5, 10, 24].map(num => (
                  <button
                    key={num}
                    onClick={() => setMineCount(num)}
                    disabled={isPlaying}
                    className={cn(
                      "py-2 rounded-lg font-bold text-sm transition-colors border",
                      mineCount === num 
                        ? "bg-primary text-black border-primary" 
                        : "bg-black/40 border-white/10 hover:bg-white/5 text-muted-foreground"
                    )}
                  >
                    {num}
                  </button>
                ))}
             </div>
             <input 
               type="range" min="1" max="24" 
               value={mineCount} 
               onChange={(e) => setMineCount(Number(e.target.value))}
               disabled={isPlaying}
               className="w-full accent-primary h-2 bg-black/40 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
             />
             <div className="text-center text-xs text-muted-foreground font-mono">{mineCount} Mines</div>
          </div>

          <div className="mt-auto space-y-3">
             {isPlaying ? (
                <div className="space-y-3">
                   <div className="bg-black/40 p-4 rounded-xl border border-white/10 flex justify-between items-center">
                      <span className="text-muted-foreground text-xs uppercase">Current Profit</span>
                      <span className="text-xl font-bold text-green-400 font-mono">+{formatCurrency(profit - betAmount)}</span>
                   </div>
                   <button
                     onClick={() => cashOut()}
                     className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl text-lg uppercase tracking-wider shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all transform hover:-translate-y-1"
                   >
                     Cash Out {formatCurrency(profit)}
                   </button>
                </div>
             ) : (
                <button
                  onClick={startGame}
                  className="w-full py-4 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl text-lg uppercase tracking-wider shadow-lg transition-all transform hover:-translate-y-1"
                >
                   {isPlaying ? "Game in Progress" : "Start Game"}
                </button>
             )}
          </div>
       </div>

       {/* Grid */}
       <div className="lg:col-span-2 flex justify-center items-center min-h-[500px] bg-black/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-5 gap-3 w-full max-w-[500px] aspect-square">
             <AnimatePresence>
             {grid.map((tile, i) => (
                <motion.button
                  key={tile.id}
                  whileHover={!tile.revealed && isPlaying ? { scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" } : {}}
                  whileTap={!tile.revealed && isPlaying ? { scale: 0.95 } : {}}
                  onClick={() => handleTileClick(i)}
                  disabled={!isPlaying && !gameOver}
                  className={cn(
                    "relative rounded-xl border transition-all duration-300 overflow-hidden flex items-center justify-center",
                    tile.revealed 
                      ? (tile.isMine ? "bg-red-500/20 border-red-500/50" : "bg-green-500/20 border-green-500/50")
                      : "bg-card border-white/10 hover:border-primary/30 cursor-pointer"
                  )}
                >
                  {tile.revealed && (
                    <motion.div
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      {tile.isMine ? (
                        <Bomb className="w-8 h-8 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                      ) : (
                        <Diamond className="w-8 h-8 text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                      )}
                    </motion.div>
                  )}
                </motion.button>
             ))}
             </AnimatePresence>
          </div>

          {/* Overlay for Game Over */}
          {gameOver && !isPlaying && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10"
             >
                <div className="text-center p-8 bg-black border border-white/10 rounded-2xl shadow-2xl transform scale-110">
                   <h2 className={cn("text-3xl font-bold mb-2", profit > betAmount ? "text-green-400" : "text-red-500")}>
                      {profit > betAmount ? "YOU WON!" : "BUSTED!"}
                   </h2>
                   <p className="text-xl font-mono mb-6">{formatCurrency(profit)}</p>
                   <button onClick={startGame} className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:scale-105 transition-transform">
                      Play Again
                   </button>
                </div>
             </motion.div>
          )}
       </div>
    </div>
  );
};

export default Mines;
