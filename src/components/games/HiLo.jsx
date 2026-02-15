import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, SkipForward } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import useSound from '../../hooks/useSound';

const SUITS = ['♠', '♥', '♣', '♦'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const VALUES = { 'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13 };

const HiLo = () => {
  const { balance, subtractBalance, addBalance } = useGameStore();
  const { playClick, playWin, playLoss, playCoin } = useSound();
  const [betAmount, setBetAmount] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCard, setCurrentCard] = useState(null);
  const [history, setHistory] = useState([]);
  const [multiplier, setMultiplier] = useState(1.0);
  const [profit, setProfit] = useState(0);

  // Probabilities
  const getHigherChance = (val) => ((13 - val) / 13) * 100;
  const getLowerChance = (val) => ((val - 1) / 13) * 100;
  const getMulti = (chance) => chance === 0 ? 0 : (99 / chance);

  const drawCard = () => {
     const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
     const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
     return { rank, suit, value: VALUES[rank] };
  };

  const startGame = () => {
    if (betAmount > balance || betAmount <= 0) return;
    if (!subtractBalance(betAmount)) return;

    setIsPlaying(true);
    setHistory([]);
    setMultiplier(1.0);
    setProfit(0);
    setCurrentCard(drawCard());
    playClick();
  };

  const guess = (direction) => { // 'higher' or 'lower'
     const nextCard = drawCard();
     // Handle Tie (Push) logic simplified: Ties lose or push? Standard is usually push or lose based on settings.
     // Let's say Tie = Same card value, we continue but no multiplier gain? Or lose?
     // Stake usually: Tie is a Push (same multiplier) unless bet on "Same". 
     // For this simple version: Tie = Loss to encourage risk, or Push. Let's do Push.
     
     let won = false;
     if (direction === 'higher' && nextCard.value >= currentCard.value) won = true;
     if (direction === 'lower' && nextCard.value <= currentCard.value) won = true;
     if (direction === 'skip') {
        setCurrentCard(nextCard);
        setHistory(prev => [currentCard, ...prev].slice(0, 5));
        playClick();
        return;
     }

     if (won) {
        // Calc new multiplier
        const chance = direction === 'higher' ? getHigherChance(currentCard.value) : getLowerChance(currentCard.value);
        // Fix: Tie logic creates inf multiplier if chance is small.
        // Simplified multiplier progression:
        const boost = direction === 'higher' ? (12.35 / (13 - currentCard.value + 0.1)) : (12.35 / (currentCard.value + 0.1));
        
        const newMult = multiplier * Math.max(1.01, boost * 0.9); // 0.9 house edge factor
        
        setMultiplier(newMult);
        setProfit(betAmount * newMult);
        setHistory(prev => [currentCard, ...prev].slice(0, 5));
        setCurrentCard(nextCard);
        playCoin();
     } else {
        endGame(false);
        setCurrentCard(nextCard); // Show the card that killed you
     }
  };

  const endGame = (cashOut) => {
     setIsPlaying(false);
     if (cashOut) {
        addBalance(profit);
        playWin();
     } else {
        playLoss();
     }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
       
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
                   <span className="text-muted-foreground text-xs uppercase">Profit</span>
                   <span className="text-green-400 font-mono font-bold text-xl">+{formatCurrency(profit)}</span>
                </div>
                <button onClick={() => endGame(true)} className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl uppercase tracking-wider">
                   Cash Out
                </button>
             </div>
          ) : (
             <button onClick={startGame} className="w-full py-4 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl uppercase tracking-wider shadow-lg">
                Start Game
             </button>
          )}
       </div>

       {/* Game Board */}
       <div className="lg:col-span-2 bg-black/40 backdrop-blur-md rounded-3xl border border-white/5 p-8 flex flex-col items-center justify-between relative overflow-hidden">
          
          {/* History */}
          <div className="flex gap-2 opacity-50">
             {history.map((c, i) => (
                <div key={i} className="w-10 h-14 bg-white rounded flex items-center justify-center text-xs font-bold text-black border border-gray-300">
                   {c.rank}
                </div>
             ))}
          </div>

          {/* Main Card */}
          <div className="flex-1 flex items-center justify-center py-8">
             <AnimatePresence mode="popLayout">
                {currentCard ? (
                   <motion.div
                     key={`${currentCard.rank}-${currentCard.suit}-${history.length}`}
                     initial={{ y: -50, opacity: 0, scale: 0.5 }}
                     animate={{ y: 0, opacity: 1, scale: 1 }}
                     exit={{ y: 50, opacity: 0 }}
                     className="w-48 h-72 bg-white rounded-2xl shadow-2xl border-4 border-white/20 flex flex-col items-center justify-center select-none relative"
                   >
                      <span className={cn("text-8xl font-black", ['♥', '♦'].includes(currentCard.suit) ? "text-red-600" : "text-black")}>
                         {currentCard.rank}
                      </span>
                      <span className={cn("text-6xl absolute top-4 left-4", ['♥', '♦'].includes(currentCard.suit) ? "text-red-600" : "text-black")}>
                         {currentCard.suit}
                      </span>
                      <span className={cn("text-6xl absolute bottom-4 right-4 rotate-180", ['♥', '♦'].includes(currentCard.suit) ? "text-red-600" : "text-black")}>
                         {currentCard.suit}
                      </span>
                   </motion.div>
                ) : (
                   <div className="w-48 h-72 bg-white/5 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center text-muted-foreground uppercase font-bold tracking-widest">
                      Start
                   </div>
                )}
             </AnimatePresence>
          </div>

          {/* Action Buttons */}
          {isPlaying && currentCard && (
             <div className="flex gap-4 w-full max-w-md">
                <button 
                  onClick={() => guess('lower')}
                  className="flex-1 py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl text-red-400 font-bold uppercase tracking-wider flex flex-col items-center gap-1"
                >
                   <ArrowDown className="w-6 h-6" />
                   Same or Lower
                </button>
                <button 
                  onClick={() => guess('skip')}
                  className="px-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 flex items-center justify-center"
                >
                   <SkipForward className="w-6 h-6 text-muted-foreground" />
                </button>
                <button 
                  onClick={() => guess('higher')}
                  className="flex-1 py-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-xl text-green-400 font-bold uppercase tracking-wider flex flex-col items-center gap-1"
                >
                   <ArrowUp className="w-6 h-6" />
                   Same or Higher
                </button>
             </div>
          )}

       </div>

    </div>
  );
};

export default HiLo;
