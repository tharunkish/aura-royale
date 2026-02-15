import { useState, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Disc } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import useSound from '../../hooks/useSound';

const SEGMENTS = {
  low: [1.5, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.5, 0],
  medium: [2.0, 1.5, 0, 1.5, 0, 2.0, 0, 1.5, 0, 3.0],
  high: [9.9, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};

const COLORS = {
  0: '#3f3f46',
  1.2: '#3b82f6',
  1.5: '#22c55e',
  2.0: '#eab308',
  3.0: '#f97316',
  9.9: '#ef4444'
};

const Wheel = () => {
  const { balance, subtractBalance, addBalance } = useGameStore();
  const { playClick, playWin, playLoss, playCoin } = useSound();
  const [betAmount, setBetAmount] = useState(10);
  const [risk, setRisk] = useState('medium');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  
  const wheelRef = useRef(null);

  const spin = async () => {
    if (betAmount > balance || betAmount <= 0) return;
    if (!subtractBalance(betAmount)) return;

    setIsSpinning(true);
    setResult(null);
    playClick();

    const segments = SEGMENTS[risk];
    const winningIndex = Math.floor(Math.random() * segments.length);
    const multiplier = segments[winningIndex];
    
    // Calculate Rotation
    const segmentAngle = 360 / segments.length;
    const extraSpins = 360 * 5;
    const stopAngle = extraSpins + (360 - (winningIndex * segmentAngle)) + (Math.random() * 20 - 10);

    if (wheelRef.current) {
       wheelRef.current.style.transition = 'transform 3s cubic-bezier(0.1, 0, 0.2, 1)';
       wheelRef.current.style.transform = `rotate(${stopAngle}deg)`;
    }

    // Ticking sound simulation (simple timeout loop)
    // In a real engine, we'd calculate ticks based on rotation speed
    
    await new Promise(r => setTimeout(r, 3000));

    setIsSpinning(false);
    
    if (multiplier > 0) {
       addBalance(betAmount * multiplier);
       playWin();
       setResult({ win: true, amount: betAmount * multiplier, mult: multiplier });
    } else {
       playLoss();
       setResult({ win: false, mult: 0 });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col lg:flex-row items-center gap-12 h-[600px] justify-center">
       
       {/* Controls */}
       <div className="w-full max-w-sm bg-card/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col gap-6 shadow-xl">
          <div className="space-y-4">
             <label className="text-muted-foreground text-sm font-bold uppercase">Bet Amount</label>
             <input 
               type="number" 
               value={betAmount}
               onChange={(e) => setBetAmount(Number(e.target.value))}
               disabled={isSpinning}
               className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-lg font-mono font-bold text-white focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>

          <div className="space-y-4">
             <label className="text-muted-foreground text-sm font-bold uppercase">Risk Level</label>
             <div className="grid grid-cols-3 gap-2">
                {['low', 'medium', 'high'].map(r => (
                   <button
                     key={r}
                     onClick={() => setRisk(r)}
                     disabled={isSpinning}
                     className={cn(
                        "py-3 rounded-lg font-bold text-sm uppercase transition-all",
                        risk === r ? "bg-primary text-black" : "bg-white/5 hover:bg-white/10 text-muted-foreground"
                     )}
                   >
                      {r}
                   </button>
                ))}
             </div>
          </div>

          <button 
            onClick={spin}
            disabled={isSpinning}
            className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl uppercase tracking-wider shadow-lg transition-transform active:scale-95 disabled:opacity-50"
          >
             Spin
          </button>
       </div>

       {/* Wheel Visual */}
       <div className="relative w-[400px] h-[400px] flex items-center justify-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
             <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-white drop-shadow-lg" />
          </div>

          <div 
            ref={wheelRef}
            className="w-full h-full rounded-full border-8 border-gray-800 shadow-2xl relative overflow-hidden transition-transform"
            style={{
               background: `conic-gradient(
                  ${SEGMENTS[risk].map((m, i) => `${COLORS[m]} ${i * 36}deg ${(i+1) * 36}deg`).join(', ')}
               )`
            }}
          >
             {/* Segments Text */}
             {SEGMENTS[risk].map((m, i) => (
                <div 
                  key={i}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[200px] flex justify-center pt-8 origin-bottom"
                  style={{ transform: `rotate(${i * 36 + 18}deg)` }}
                >
                   <span className="text-white font-bold text-lg drop-shadow-md rotate-180" style={{ transform: 'rotate(180deg)' }}>{m}x</span>
                </div>
             ))}
          </div>

          {/* Center Hub */}
          <div className="absolute w-24 h-24 bg-gray-900 rounded-full border-4 border-gray-700 flex items-center justify-center shadow-xl z-10">
             <AnimatePresence mode="wait">
                {result ? (
                   <motion.div
                     key="res"
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     className={cn("text-2xl font-black", result.win ? "text-green-400" : "text-gray-500")}
                   >
                      {result.mult}x
                   </motion.div>
                ) : (
                   <Disc className="w-10 h-10 text-gray-600" />
                )}
             </AnimatePresence>
          </div>
       </div>

    </div>
  );
};

export default Wheel;
