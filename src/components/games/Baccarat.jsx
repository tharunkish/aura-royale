import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, cn } from '../../lib/utils';
import useSound from '../../hooks/useSound';

const CARDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 0, 0, 0]; // 0 = 10/J/Q/K (Value 0 in Baccarat)

const Baccarat = () => {
  const { balance, subtractBalance, addBalance } = useGameStore();
  const { playClick, playWin, playLoss, playCoin } = useSound();
  const [betAmount, setBetAmount] = useState(10);
  const [betType, setBetType] = useState(null); // 'player', 'banker', 'tie'
  const [gameState, setGameState] = useState('idle'); // idle, dealing, resolved
  const [playerHand, setPlayerHand] = useState([]);
  const [bankerHand, setBankerHand] = useState([]);
  const [message, setMessage] = useState('');

  const getVal = (hand) => {
     const sum = hand.reduce((acc, card) => acc + (card === 0 ? 0 : card), 0);
     return sum % 10;
  };

  const deal = async (type) => {
    if (betAmount > balance || betAmount <= 0) return;
    if (!subtractBalance(betAmount)) return;

    setBetType(type);
    setGameState('dealing');
    setPlayerHand([]);
    setBankerHand([]);
    setMessage('');
    playClick();

    // Deal sequence
    const p1 = Math.floor(Math.random() * 10);
    const p2 = Math.floor(Math.random() * 10);
    const b1 = Math.floor(Math.random() * 10);
    const b2 = Math.floor(Math.random() * 10);

    await new Promise(r => setTimeout(r, 500));
    setPlayerHand([p1]);
    playCoin();
    await new Promise(r => setTimeout(r, 500));
    setBankerHand([b1]);
    playCoin();
    await new Promise(r => setTimeout(r, 500));
    setPlayerHand([p1, p2]);
    playCoin();
    await new Promise(r => setTimeout(r, 500));
    setBankerHand([b1, b2]);
    playCoin();

    // 3rd Card Logic (Simplified for prototype: Draw random if < 6)
    // Real Baccarat rules are complex, let's use simplified "Draw if < 6"
    let finalP = [p1, p2];
    let finalB = [b1, b2];
    
    if (getVal(finalP) < 6) {
       await new Promise(r => setTimeout(r, 500));
       finalP.push(Math.floor(Math.random() * 10));
       setPlayerHand([...finalP]);
       playCoin();
    }
    
    if (getVal(finalB) < 6) {
       await new Promise(r => setTimeout(r, 500));
       finalB.push(Math.floor(Math.random() * 10));
       setBankerHand([...finalB]);
       playCoin();
    }

    resolve(finalP, finalB, type);
  };

  const resolve = (p, b, type) => {
     const pVal = getVal(p);
     const bVal = getVal(b);
     
     let winner = 'tie';
     if (pVal > bVal) winner = 'player';
     if (bVal > pVal) winner = 'banker';
     
     let won = false;
     let payout = 0;

     if (type === 'player' && winner === 'player') {
        payout = betAmount * 2;
        won = true;
     } else if (type === 'banker' && winner === 'banker') {
        payout = betAmount * 1.95; // 5% commission
        won = true;
     } else if (type === 'tie' && winner === 'tie') {
        payout = betAmount * 9;
        won = true;
     }

     if (won) {
        addBalance(payout);
        playWin();
        setMessage(`You Won! ${winner.toUpperCase()} wins.`);
     } else {
        playLoss();
        setMessage(`${winner.toUpperCase()} wins.`);
     }
     
     setGameState('resolved');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col gap-12 h-[600px] justify-center items-center">
       
       {/* Table */}
       <div className="w-full max-w-3xl aspect-[2/1] bg-[#0d3321] rounded-full border-8 border-[#3b2a1a] shadow-2xl relative flex flex-col items-center justify-center p-8">
          <div className="absolute inset-0 border-2 border-[#d4af37]/20 rounded-full m-4" />
          
          <div className="flex justify-between w-full px-12 z-10">
             
             {/* Player Side */}
             <div className="flex flex-col items-center gap-4">
                <h3 className="text-blue-400 font-serif text-2xl uppercase tracking-widest font-bold">Player</h3>
                <div className="flex gap-2 min-h-[100px]">
                   {playerHand.map((c, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ scale: 0, rotate: -20 }} 
                        animate={{ scale: 1, rotate: 0 }}
                        className="w-16 h-24 bg-white rounded shadow-lg flex items-center justify-center text-2xl font-bold text-black border border-gray-300"
                      >
                         {c}
                      </motion.div>
                   ))}
                </div>
                <div className="text-4xl font-display font-bold text-white">{playerHand.length > 0 ? getVal(playerHand) : '-'}</div>
             </div>

             {/* Banker Side */}
             <div className="flex flex-col items-center gap-4">
                <h3 className="text-red-400 font-serif text-2xl uppercase tracking-widest font-bold">Banker</h3>
                <div className="flex gap-2 min-h-[100px]">
                   {bankerHand.map((c, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ scale: 0, rotate: 20 }} 
                        animate={{ scale: 1, rotate: 0 }}
                        className="w-16 h-24 bg-white rounded shadow-lg flex items-center justify-center text-2xl font-bold text-black border border-gray-300"
                      >
                         {c}
                      </motion.div>
                   ))}
                </div>
                <div className="text-4xl font-display font-bold text-white">{bankerHand.length > 0 ? getVal(bankerHand) : '-'}</div>
             </div>

          </div>

          <AnimatePresence>
             {message && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="absolute bottom-12 bg-black/60 px-6 py-2 rounded-full text-xl font-bold text-[#d4af37] border border-[#d4af37]/50 backdrop-blur-md"
                >
                   {message}
                </motion.div>
             )}
          </AnimatePresence>
       </div>

       {/* Betting Controls */}
       <div className="flex flex-col items-center gap-6 w-full max-w-md">
          <div className="relative w-full">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
             <input 
               type="number" 
               value={betAmount}
               onChange={(e) => setBetAmount(Number(e.target.value))}
               disabled={gameState === 'dealing'}
               className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-lg font-mono font-bold text-white focus:outline-none focus:border-primary/50 transition-all text-center"
            />
          </div>

          <div className="flex gap-4 w-full">
             <button 
               onClick={() => deal('player')} 
               disabled={gameState === 'dealing'}
               className="flex-1 py-6 bg-blue-900/50 hover:bg-blue-800 border border-blue-500/30 rounded-xl text-blue-400 font-bold uppercase tracking-widest transition-all"
             >
                Player (2x)
             </button>
             <button 
               onClick={() => deal('tie')} 
               disabled={gameState === 'dealing'}
               className="flex-[0.5] py-6 bg-green-900/50 hover:bg-green-800 border border-green-500/30 rounded-xl text-green-400 font-bold uppercase tracking-widest transition-all"
             >
                Tie (9x)
             </button>
             <button 
               onClick={() => deal('banker')} 
               disabled={gameState === 'dealing'}
               className="flex-1 py-6 bg-red-900/50 hover:bg-red-800 border border-red-500/30 rounded-xl text-red-400 font-bold uppercase tracking-widest transition-all"
             >
                Banker (1.95x)
             </button>
          </div>
       </div>

    </div>
  );
};

export default Baccarat;
