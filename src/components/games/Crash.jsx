import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, TrendingUp, XCircle } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import useSound from '../../hooks/useSound';

const Crash = () => {
  const { balance, subtractBalance, addBalance } = useGameStore();
  const { playClick, playWin, playLoss } = useSound();
  const [betAmount, setBetAmount] = useState(10);
  const [multiplier, setMultiplier] = useState(1.00);
  const [gameState, setGameState] = useState('idle'); // idle, running, crashed, cashed
  const [crashPoint, setCrashPoint] = useState(0);
  const [history, setHistory] = useState([]);
  
  const requestRef = useRef();
  const startTimeRef = useRef();

  const startGame = () => {
    if (betAmount > balance || betAmount <= 0) return;
    if (!subtractBalance(betAmount)) return;

    // Determine Crash Point (Provably Fair Logic Sim)
    // 1% Instant Crash (House Edge)
    // E = 100 / (1 - h) * r
    const r = Math.random();
    const crash = Math.max(1.00, (0.99 / (1 - r)));
    
    setCrashPoint(crash);
    setMultiplier(1.00);
    setGameState('running');
    playClick(); // Engine start sound
    
    startTimeRef.current = Date.now();
    requestRef.current = requestAnimationFrame(updateGame);
  };

  const updateGame = () => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000; // seconds
    // Exponential Growth Formula: 1.00 * e^(0.06 * t)
    // Tweaked for gameplay feel:
    const currentMult = Math.pow(Math.E, 0.06 * elapsed * 2.5);
    
    if (currentMult >= crashPoint) {
       crash(crashPoint);
    } else {
       setMultiplier(currentMult);
       requestRef.current = requestAnimationFrame(updateGame);
    }
  };

  const crash = (finalValue) => {
    setMultiplier(finalValue);
    setGameState('crashed');
    setHistory(prev => [finalValue, ...prev].slice(0, 5));
    cancelAnimationFrame(requestRef.current);
    playLoss();
  };

  const cashOut = () => {
    if (gameState !== 'running') return;
    cancelAnimationFrame(requestRef.current);
    
    const winAmount = betAmount * multiplier;
    addBalance(winAmount);
    setGameState('cashed');
    playWin();
    
    // Continue animation for visual effect only (optional, but better to stop for clarity)
    // Or let it run in background to show what "would have happened"
  };

  useEffect(() => {
     return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
       
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
                  disabled={gameState === 'running'}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-lg font-mono font-bold text-white focus:outline-none focus:border-primary/50 transition-all disabled:opacity-50"
                />
             </div>
             <div className="flex gap-2">
                <button onClick={() => setBetAmount(betAmount * 2)} disabled={gameState === 'running'} className="flex-1 py-2 bg-white/5 rounded text-xs font-bold hover:bg-white/10">2x</button>
                <button onClick={() => setBetAmount(balance)} disabled={gameState === 'running'} className="flex-1 py-2 bg-white/5 rounded text-xs font-bold hover:bg-white/10">MAX</button>
             </div>
          </div>

          <button
            onClick={gameState === 'running' ? cashOut : startGame}
            disabled={gameState === 'crashed' || gameState === 'cashed'}
            className={cn(
               "w-full py-4 rounded-xl text-xl font-bold uppercase tracking-wider shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2",
               gameState === 'running' 
                  ? "bg-green-500 hover:bg-green-400 text-black shadow-[0_0_20px_rgba(34,197,94,0.4)]" 
                  : "bg-primary hover:bg-primary/90 text-black"
            )}
          >
             {gameState === 'running' ? (
                <>Cash Out <span className="text-sm opacity-80">({formatCurrency(betAmount * multiplier)})</span></>
             ) : (
                gameState === 'crashed' ? "Crashed!" : 
                gameState === 'cashed' ? "You Won!" : "Launch Rocket"
             )}
          </button>
          
          {gameState === 'crashed' && (
             <button onClick={() => setGameState('idle')} className="w-full py-3 bg-white/10 rounded-lg text-sm font-bold hover:bg-white/20">
                Reset
             </button>
          )}
       </div>

       {/* Game Canvas */}
       <div className="lg:col-span-2 bg-black/40 backdrop-blur-md rounded-3xl border border-white/5 p-8 relative overflow-hidden flex flex-col">
          
          {/* History Bar */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
             {history.map((h, i) => (
                <div key={i} className={cn("px-3 py-1 rounded-full text-xs font-bold font-mono", h >= 2 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                   {h.toFixed(2)}x
                </div>
             ))}
          </div>

          <div className="flex-1 flex items-center justify-center relative">
             {/* Background Grid Lines - Animated */}
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />

             {/* Multiplier Display */}
             <div className="relative z-10 text-center">
                <div className={cn(
                   "text-7xl md:text-9xl font-display font-black tracking-tighter tabular-nums transition-colors duration-100",
                   gameState === 'crashed' ? "text-red-500" : 
                   gameState === 'cashed' ? "text-green-400" : "text-white"
                )}>
                   {multiplier.toFixed(2)}x
                </div>
                <div className={cn(
                   "text-sm font-bold uppercase tracking-[0.5em] mt-2 transition-opacity",
                   gameState === 'running' ? "text-primary animate-pulse" : "text-muted-foreground"
                )}>
                   {gameState === 'running' ? "Flying..." : gameState === 'crashed' ? "Crashed" : "Ready"}
                </div>
             </div>

             {/* Rocket Visual (Simple CSS Animation) */}
             {gameState === 'running' && (
                <motion.div 
                  animate={{ 
                     x: [0, 5, -5, 0], 
                     y: [0, -5, 5, 0] 
                  }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="absolute bottom-10 left-10 text-primary"
                >
                   <Rocket className="w-16 h-16 rotate-45 drop-shadow-[0_0_20px_currentColor]" />
                </motion.div>
             )}
          </div>
       </div>

    </div>
  );
};

export default Crash;
