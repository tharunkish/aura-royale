import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Play, Info } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import confetti from 'canvas-confetti';

const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const COLORS = {
  0: '#22c55e', // Green
  // Red
  1: '#ef4444', 3: '#ef4444', 5: '#ef4444', 7: '#ef4444', 9: '#ef4444', 12: '#ef4444', 14: '#ef4444', 16: '#ef4444', 18: '#ef4444', 19: '#ef4444', 21: '#ef4444', 23: '#ef4444', 25: '#ef4444', 27: '#ef4444', 30: '#ef4444', 32: '#ef4444', 34: '#ef4444', 36: '#ef4444',
  // Black
  2: '#000000', 4: '#000000', 6: '#000000', 8: '#000000', 10: '#000000', 11: '#000000', 13: '#000000', 15: '#000000', 17: '#000000', 20: '#000000', 22: '#000000', 24: '#000000', 26: '#000000', 28: '#000000', 29: '#000000', 31: '#000000', 33: '#000000', 35: '#000000'
};

const Roulette = () => {
  const { balance, subtractBalance, addBalance } = useGameStore();
  const [betAmount, setBetAmount] = useState(10);
  const [bets, setBets] = useState({}); // { 'red': 10, '17': 5 }
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const wheelRef = useRef(null);

  const placeBet = (type) => {
    if (isSpinning) return;
    const currentBet = bets[type] || 0;
    if (balance >= betAmount) {
       // Just visual tracking, actual deduction on spin
       setBets({ ...bets, [type]: currentBet + betAmount });
    }
  };

  const clearBets = () => {
    if (!isSpinning) setBets({});
  };

  const spinWheel = async () => {
    const totalBet = Object.values(bets).reduce((a, b) => a + b, 0);
    if (totalBet === 0 || totalBet > balance) return;
    if (!subtractBalance(totalBet)) return;

    setIsSpinning(true);
    setResult(null);

    // Random Outcome
    const winningIndex = Math.floor(Math.random() * WHEEL_NUMBERS.length);
    const winningNumber = WHEEL_NUMBERS[winningIndex];
    
    // Calculate Rotation
    // 360 / 37 segments ≈ 9.73 degrees per segment
    // Spin at least 5 full rotations (1800 deg)
    // Offset to land on the correct number
    const segmentAngle = 360 / 37;
    const targetAngle = 360 - (winningIndex * segmentAngle); // Counter-clockwise logic
    const totalRotation = 1800 + targetAngle + (Math.random() * segmentAngle * 0.8 - segmentAngle * 0.4); // Add jitter

    // Animate
    if (wheelRef.current) {
       wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.1, 0, 0.2, 1)';
       wheelRef.current.style.transform = `rotate(${totalRotation}deg)`;
    }

    await new Promise(r => setTimeout(r, 4000));

    setIsSpinning(false);
    setResult(winningNumber);

    // Calculate Winnings
    let winTotal = 0;
    
    // Check Straight Bets
    if (bets[winningNumber]) winTotal += bets[winningNumber] * 36;
    
    // Check Color
    const color = COLORS[winningNumber];
    if (color === '#ef4444' && bets['red']) winTotal += bets['red'] * 2;
    if (color === '#000000' && bets['black']) winTotal += bets['black'] * 2;
    
    // Check Parity
    if (winningNumber !== 0) {
       if (winningNumber % 2 === 0 && bets['even']) winTotal += bets['even'] * 2;
       if (winningNumber % 2 !== 0 && bets['odd']) winTotal += bets['odd'] * 2;
    }
    
    // Check Ranges
    if (winningNumber >= 1 && winningNumber <= 18 && bets['1-18']) winTotal += bets['1-18'] * 2;
    if (winningNumber >= 19 && winningNumber <= 36 && bets['19-36']) winTotal += bets['19-36'] * 2;

    if (winTotal > 0) {
       addBalance(winTotal);
       confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: [COLORS[winningNumber]]
       });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col lg:flex-row gap-8 items-start">
       
       {/* Wheel Section */}
       <div className="flex-1 flex flex-col items-center justify-center bg-black/40 p-8 rounded-3xl border border-white/5 relative overflow-hidden h-[500px]">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
             <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-primary drop-shadow-lg" />
          </div>
          
          <div 
            ref={wheelRef}
            className="w-[400px] h-[400px] rounded-full border-8 border-[#2e2e2e] relative shadow-2xl transition-transform"
            style={{ 
               background: `conic-gradient(
                  ${WHEEL_NUMBERS.map((n, i) => `${COLORS[n]} ${i * (360/37)}deg ${(i+1) * (360/37)}deg`).join(', ')}
               )`
            }}
          >
             {/* Inner circle for visual fidelity */}
             <div className="absolute inset-0 m-auto w-3/4 h-3/4 rounded-full border-4 border-[#d4af37] bg-[#1a1a1a] flex items-center justify-center">
                <div className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
                   {result !== null ? result : "SPIN"}
                </div>
             </div>
          </div>
       </div>

       {/* Betting Board */}
       <div className="w-full lg:w-[500px] bg-green-900/20 p-6 rounded-3xl border border-white/5 backdrop-blur-md">
          
          <div className="mb-6 flex justify-between items-center">
             <div className="flex gap-2">
                {[10, 50, 100, 500].map(amt => (
                   <button 
                     key={amt}
                     onClick={() => setBetAmount(amt)}
                     className={cn(
                        "w-10 h-10 rounded-full border-2 font-bold text-xs flex items-center justify-center transition-transform hover:scale-110",
                        betAmount === amt ? "bg-primary border-white text-black scale-110" : "bg-white/10 border-white/20 text-white"
                     )}
                   >
                      {amt}
                   </button>
                ))}
             </div>
             <button onClick={clearBets} className="text-xs text-red-400 font-bold uppercase hover:underline">Clear Bets</button>
          </div>

          <div className="grid grid-cols-12 gap-1 mb-4">
             {/* Zero */}
             <button 
               onClick={() => placeBet(0)}
               className="col-span-12 h-10 bg-green-600 rounded text-white font-bold hover:brightness-110 relative"
             >
                0
                {bets[0] > 0 && <span className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] px-1 rounded-full">{bets[0]}</span>}
             </button>

             {/* Numbers */}
             {Array.from({ length: 36 }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => placeBet(num)}
                  className={cn(
                     "col-span-3 h-12 rounded font-bold text-white hover:brightness-110 relative border border-white/10",
                     COLORS[num] === '#ef4444' ? "bg-red-600" : "bg-zinc-900"
                  )}
                >
                   {num}
                   {bets[num] > 0 && <span className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] px-1 rounded-full">{bets[num]}</span>}
                </button>
             ))}
             
             {/* Outside Bets */}
             <button onClick={() => placeBet('1-18')} className="col-span-4 h-10 bg-white/5 text-xs font-bold uppercase rounded hover:bg-white/10 relative border border-white/10 mt-2">1-18 {bets['1-18'] > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />}</button>
             <button onClick={() => placeBet('even')} className="col-span-4 h-10 bg-white/5 text-xs font-bold uppercase rounded hover:bg-white/10 relative border border-white/10 mt-2">EVEN {bets['even'] > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />}</button>
             <button onClick={() => placeBet('red')} className="col-span-2 h-10 bg-red-600 text-xs font-bold uppercase rounded hover:brightness-110 relative border border-white/10 mt-2">RED {bets['red'] > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />}</button>
             <button onClick={() => placeBet('black')} className="col-span-2 h-10 bg-black text-xs font-bold uppercase rounded hover:brightness-110 relative border border-white/10 mt-2">BLK {bets['black'] > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />}</button>
             <button onClick={() => placeBet('odd')} className="col-span-4 h-10 bg-white/5 text-xs font-bold uppercase rounded hover:bg-white/10 relative border border-white/10 mt-2">ODD {bets['odd'] > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />}</button>
             <button onClick={() => placeBet('19-36')} className="col-span-4 h-10 bg-white/5 text-xs font-bold uppercase rounded hover:bg-white/10 relative border border-white/10 mt-2">19-36 {bets['19-36'] > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />}</button>
          </div>

          <button 
            onClick={spinWheel}
            disabled={isSpinning}
            className="w-full py-4 bg-primary text-black font-bold text-xl uppercase tracking-widest rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(255,215,0,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
             {isSpinning ? "Spinning..." : "SPIN"}
          </button>
       </div>

    </div>
  );
};

export default Roulette;
