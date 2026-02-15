import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCurrency } from '../../lib/utils';
import { Play, RotateCcw } from 'lucide-react';

const CARD_VALUES = {
  'A': 11, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10
};

const SUITS = ['♠', '♥', '♣', '♦'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const Blackjack = () => {
  const { balance, subtractBalance, addBalance } = useGameStore();
  const [betAmount, setBetAmount] = useState(10);
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameState, setGameState] = useState('idle'); // idle, dealing, player-turn, dealer-turn, resolved
  const [message, setMessage] = useState('');
  
  // Audio refs can be added here

  const createDeck = () => {
    let newDeck = [];
    for (let i = 0; i < 6; i++) { // 6 Decks
      SUITS.forEach(suit => {
        RANKS.forEach(rank => {
          newDeck.push({ suit, rank, value: CARD_VALUES[rank] });
        });
      });
    }
    return newDeck.sort(() => Math.random() - 0.5);
  };

  const getHandValue = (hand) => {
    let value = hand.reduce((acc, card) => acc + card.value, 0);
    let aces = hand.filter(card => card.rank === 'A').length;
    while (value > 21 && aces > 0) {
      value -= 10;
      aces -= 1;
    }
    return value;
  };

  const dealCard = (targetHand, setTargetHand, deckSource) => {
    const card = deckSource.pop();
    setTargetHand(prev => [...prev, card]);
    return card;
  };

  const startGame = async () => {
    if (betAmount > balance || betAmount <= 0) return;
    if (!subtractBalance(betAmount)) return;

    const newDeck = createDeck();
    setDeck(newDeck);
    setPlayerHand([]);
    setDealerHand([]);
    setGameState('dealing');
    setMessage('');

    // Deal initial cards
    await new Promise(r => setTimeout(r, 300));
    const p1 = newDeck.pop();
    setPlayerHand([p1]);
    
    await new Promise(r => setTimeout(r, 300));
    const d1 = newDeck.pop();
    setDealerHand([d1]);

    await new Promise(r => setTimeout(r, 300));
    const p2 = newDeck.pop();
    setPlayerHand(prev => [...prev, p2]);

    await new Promise(r => setTimeout(r, 300));
    const d2 = newDeck.pop(); // Hidden card
    setDealerHand(prev => [...prev, d2]);

    setGameState('player-turn');

    // Check for Blackjack
    const pValue = getHandValue([p1, p2]);
    if (pValue === 21) {
       handleStand(true); 
    }
  };

  const handleHit = async () => {
    if (gameState !== 'player-turn') return;
    const newDeck = [...deck];
    const card = newDeck.pop();
    setDeck(newDeck);
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);

    if (getHandValue(newHand) > 21) {
      setGameState('resolved');
      setMessage('Bust! Dealer Wins.');
    }
  };

  const handleStand = async (instantBlackjack = false) => {
    setGameState('dealer-turn');
    let currentDeck = [...deck];
    let currentDealerHand = [...dealerHand];
    
    // Reveal hidden card animation delay if needed
    
    // Dealer Logic: Hit on soft 17 (simplified: hit < 17)
    while (getHandValue(currentDealerHand) < 17) {
      await new Promise(r => setTimeout(r, 800));
      const card = currentDeck.pop();
      currentDealerHand = [...currentDealerHand, card];
      setDealerHand(currentDealerHand);
    }

    setDeck(currentDeck);
    resolveGame(playerHand, currentDealerHand, instantBlackjack);
  };

  const resolveGame = (pHand, dHand, instantBlackjack) => {
    const pValue = getHandValue(pHand);
    const dValue = getHandValue(dHand);
    
    setGameState('resolved');

    if (instantBlackjack) {
       if (dValue === 21 && dHand.length === 2) {
          addBalance(betAmount); // Push
          setMessage('Push (Both Blackjack)');
       } else {
          addBalance(betAmount * 2.5); // Blackjack pays 3:2
          setMessage('Blackjack! You Win!');
       }
       return;
    }

    if (dValue > 21) {
      addBalance(betAmount * 2);
      setMessage('Dealer Busts! You Win!');
    } else if (pValue > dValue) {
      addBalance(betAmount * 2);
      setMessage('You Win!');
    } else if (pValue === dValue) {
      addBalance(betAmount);
      setMessage('Push.');
    } else {
      setMessage('Dealer Wins.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col gap-8 min-h-[600px] justify-center">
      
      {/* Dealer Area */}
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-muted-foreground uppercase text-sm tracking-widest font-bold">Dealer ({gameState === 'player-turn' ? '?' : getHandValue(dealerHand)})</h2>
        <div className="flex justify-center -space-x-12 h-32">
           <AnimatePresence>
           {dealerHand.map((card, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: -50, x: -50, rotate: -10 }}
               animate={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
               transition={{ delay: i * 0.1 }}
               className="relative w-24 h-36 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col items-center justify-center select-none"
             >
               {gameState === 'player-turn' && i === 1 ? (
                 <div className="absolute inset-0 bg-red-800 rounded-lg border-2 border-white/20 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20" />
                 </div>
               ) : (
                 <>
                   <span className={cn("text-2xl font-bold", ['♥', '♦'].includes(card.suit) ? "text-red-500" : "text-black")}>
                     {card.rank}{card.suit}
                   </span>
                   <span className="absolute top-2 left-2 text-xs font-bold text-gray-400">{card.rank}</span>
                   <span className="absolute bottom-2 right-2 text-xs font-bold text-gray-400 rotate-180">{card.rank}</span>
                 </>
               )}
             </motion.div>
           ))}
           </AnimatePresence>
        </div>
      </div>

      {/* Message Area */}
      <div className="h-16 flex items-center justify-center">
         {message && (
            <motion.div
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className={cn(
                  "px-8 py-2 rounded-full font-bold text-xl uppercase tracking-widest border",
                  message.includes('Win') ? "bg-green-500/20 text-green-400 border-green-500" : 
                  message.includes('Bust') || message.includes('Dealer Wins') ? "bg-red-500/20 text-red-400 border-red-500" :
                  "bg-white/10 text-white border-white/20"
               )}
            >
               {message}
            </motion.div>
         )}
      </div>

      {/* Player Area */}
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-muted-foreground uppercase text-sm tracking-widest font-bold">You ({getHandValue(playerHand)})</h2>
        <div className="flex justify-center -space-x-12 h-32">
           <AnimatePresence>
           {playerHand.map((card, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 50, x: -50, rotate: 10 }}
               animate={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
               transition={{ delay: i * 0.1 }}
               className="relative w-24 h-36 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col items-center justify-center select-none z-10 hover:-translate-y-4 transition-transform"
             >
               <span className={cn("text-2xl font-bold", ['♥', '♦'].includes(card.suit) ? "text-red-500" : "text-black")}>
                 {card.rank}{card.suit}
               </span>
               <span className="absolute top-2 left-2 text-xs font-bold text-gray-400">{card.rank}</span>
               <span className="absolute bottom-2 right-2 text-xs font-bold text-gray-400 rotate-180">{card.rank}</span>
             </motion.div>
           ))}
           </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4 mt-8">
         {gameState === 'idle' || gameState === 'resolved' ? (
            <div className="flex gap-4 items-center bg-black/40 p-4 rounded-xl border border-white/10">
               <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input 
                    type="number" 
                    value={betAmount} 
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    className="w-32 bg-transparent border border-white/20 rounded-lg py-2 pl-6 text-white font-bold focus:outline-none focus:border-primary"
                  />
               </div>
               <button 
                  onClick={startGame}
                  className="bg-primary text-black font-bold px-8 py-2 rounded-lg hover:shadow-[0_0_15px_rgba(255,215,0,0.4)] transition-all"
               >
                  DEAL
               </button>
            </div>
         ) : (
            <div className="flex gap-4">
               <button 
                  onClick={handleHit}
                  disabled={gameState !== 'player-turn'}
                  className="bg-green-500 text-black font-bold px-8 py-3 rounded-lg hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-all"
               >
                  HIT
               </button>
               <button 
                  onClick={() => handleStand()}
                  disabled={gameState !== 'player-turn'}
                  className="bg-red-500 text-black font-bold px-8 py-3 rounded-lg hover:bg-red-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
               >
                  STAND
               </button>
            </div>
         )}
      </div>

    </div>
  );
};

export default Blackjack;
