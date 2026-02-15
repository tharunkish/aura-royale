import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatCurrency } from '../../lib/utils';
import { Hand as HandSolver } from 'pokersolver';

const SUITS = ['s', 'h', 'c', 'd']; // Spades, Hearts, Clubs, Diamonds (standard format for solver)
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

// Visual Mapping
const SUIT_ICONS = { 's': '♠', 'h': '♥', 'c': '♣', 'd': '♦' };
const RANK_DISPLAY = { 'T': '10' }; // Others match

const Poker = () => {
  const { balance, subtractBalance, addBalance } = useGameStore();
  const [betAmount, setBetAmount] = useState(10);
  const [gameState, setGameState] = useState('ante'); // ante, flop, turn, river, showdown
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [communityCards, setCommunityCards] = useState([]);
  const [deck, setDeck] = useState([]);
  const [pot, setPot] = useState(0);
  const [message, setMessage] = useState('');

  const createDeck = () => {
    const d = [];
    SUITS.forEach(s => RANKS.forEach(r => d.push({ rank: r, suit: s })));
    return d.sort(() => Math.random() - 0.5);
  };

  const dealInitial = async () => {
    if (betAmount > balance || betAmount <= 0) return;
    if (!subtractBalance(betAmount)) return;

    setPot(betAmount * 2); // Ante + Dealer Match
    const newDeck = createDeck();
    
    // Deal Hole Cards
    const pHand = [newDeck.pop(), newDeck.pop()];
    const dHand = [newDeck.pop(), newDeck.pop()];
    
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setDeck(newDeck);
    setCommunityCards([]);
    setGameState('flop');
    setMessage('Check or Fold?');
  };

  const advanceStage = () => {
    const newDeck = [...deck];
    let newCommunity = [...communityCards];

    if (gameState === 'flop') {
       newCommunity.push(newDeck.pop(), newDeck.pop(), newDeck.pop());
       setGameState('turn');
    } else if (gameState === 'turn') {
       newCommunity.push(newDeck.pop());
       setGameState('river');
    } else if (gameState === 'river') {
       newCommunity.push(newDeck.pop());
       setGameState('showdown');
       evaluateWinner(playerHand, dealerHand, newCommunity);
    }
    
    setCommunityCards(newCommunity);
    setDeck(newDeck);
  };

  const handleCheck = () => {
    advanceStage();
  };

  const handleFold = () => {
    setGameState('ante');
    setMessage('You Folded.');
    setPot(0);
  };

  const evaluateWinner = (pHand, dHand, community) => {
    // Format cards for solver: "Ad", "Ts", "2c"
    const format = (c) => `${c.rank}${c.suit}`;
    const formattedComm = community.map(format);
    
    const pSolver = HandSolver.solve([...pHand.map(format), ...formattedComm]);
    const dSolver = HandSolver.solve([...dHand.map(format), ...formattedComm]);
    
    const winners = HandSolver.winners([pSolver, dSolver]);
    
    // Check if player won
    // HandSolver.winners returns array of winning Hand objects.
    // We can check if the player's hand description matches the winner's description and cards
    
    // A simpler way with this library:
    // It attaches a custom toString() or we can compare ranks
    
    if (winners.length === 2) {
       addBalance(pot / 2);
       setMessage(`Push! Both have ${pSolver.descr}`);
    } else if (winners[0] === pSolver) {
       addBalance(pot);
       setMessage(`You Win! ${pSolver.descr}`);
    } else {
       setMessage(`Dealer Wins with ${dSolver.descr}`);
    }
  };

  // Helper to display card cleanly
  const Card = ({ card, hidden }) => {
     if (hidden) {
        return (
           <div className="w-20 h-28 bg-red-800 rounded-lg shadow-xl border border-white/10 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]" />
        );
     }
     const isRed = ['h', 'd'].includes(card.suit);
     const displayRank = RANK_DISPLAY[card.rank] || card.rank;
     
     return (
        <motion.div
           layout
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="w-20 h-28 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col items-center justify-center select-none"
        >
           <span className={cn("text-3xl font-bold", isRed ? "text-red-600" : "text-black")}>
              {displayRank}
              <span className="text-2xl">{SUIT_ICONS[card.suit]}</span>
           </span>
        </motion.div>
     );
  };

  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col gap-8 min-h-[600px] justify-center items-center">
       
       {/* Community Cards */}
       <div className="flex gap-4 min-h-[140px] items-center justify-center p-8 bg-green-900/20 rounded-full border border-green-500/20 shadow-[inset_0_0_50px_rgba(34,197,94,0.1)]">
          <AnimatePresence>
             {communityCards.map((card, i) => (
                <Card key={`comm-${i}`} card={card} />
             ))}
             {communityCards.length === 0 && <div className="text-green-500/30 font-bold uppercase tracking-widest">Community Cards</div>}
          </AnimatePresence>
       </div>

       {/* Hands Area */}
       <div className="flex justify-between w-full max-w-3xl gap-12">
          
          {/* Dealer Hand */}
          <div className="flex flex-col items-center gap-2">
             <div className="flex gap-2">
                {dealerHand.map((card, i) => (
                   <Card key={`dealer-${i}`} card={card} hidden={gameState !== 'showdown'} />
                ))}
             </div>
             <span className="text-xs uppercase font-bold text-muted-foreground">Dealer</span>
          </div>

          {/* Pot */}
          <div className="flex flex-col items-center justify-center">
             <div className="bg-black/50 px-6 py-2 rounded-full border border-yellow-500/30 text-yellow-400 font-mono font-bold text-xl shadow-[0_0_20px_rgba(255,215,0,0.2)]">
                POT: {formatCurrency(pot)}
             </div>
             <motion.div 
               key={message}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="mt-4 text-center text-white font-bold h-6 text-lg drop-shadow-lg"
             >
                {message}
             </motion.div>
          </div>

          {/* Player Hand */}
          <div className="flex flex-col items-center gap-2">
             <div className="flex gap-2">
                {playerHand.map((card, i) => (
                   <Card key={`player-${i}`} card={card} />
                ))}
             </div>
             <span className="text-xs uppercase font-bold text-muted-foreground">You</span>
          </div>

       </div>

       {/* Controls */}
       <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4 bg-black/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl z-50">
          {gameState === 'ante' ? (
             <>
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                   <input 
                     type="number" 
                     value={betAmount} 
                     onChange={(e) => setBetAmount(Number(e.target.value))}
                     className="w-32 bg-transparent border border-white/20 rounded-lg py-3 pl-8 text-white font-bold focus:outline-none focus:border-green-500"
                   />
                </div>
                <button 
                  onClick={dealInitial}
                  className="bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-3 rounded-lg uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                >
                   Deal Hand
                </button>
             </>
          ) : (
             gameState !== 'showdown' && (
                <>
                   <button 
                     onClick={handleCheck}
                     className="bg-secondary hover:bg-white/10 text-white font-bold px-8 py-3 rounded-lg uppercase tracking-wider transition-colors border border-white/10"
                   >
                      Check
                   </button>
                   <button 
                     onClick={handleFold}
                     className="bg-red-900/50 hover:bg-red-800/50 text-red-400 font-bold px-8 py-3 rounded-lg uppercase tracking-wider transition-colors border border-red-500/20"
                   >
                      Fold
                   </button>
                   <button 
                     onClick={() => { subtractBalance(betAmount); setPot(pot + betAmount); advanceStage(); }}
                     className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-8 py-3 rounded-lg uppercase tracking-wider transition-colors shadow-[0_0_15px_rgba(255,215,0,0.4)]"
                   >
                      Raise {formatCurrency(betAmount)}
                   </button>
                </>
             )
          )}
          {gameState === 'showdown' && (
             <button 
               onClick={() => { setGameState('ante'); setPot(0); setPlayerHand([]); setDealerHand([]); setCommunityCards([]); setMessage(''); }}
               className="bg-white text-black font-bold px-8 py-3 rounded-lg uppercase tracking-wider hover:scale-105 transition-transform"
             >
                New Hand
             </button>
          )}
       </div>

    </div>
  );
};

export default Poker;
