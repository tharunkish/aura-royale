import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Trophy, Wallet } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

const FAKE_USERS = [
  'Rocket_Man', 'CryptoCat', 'AuraWhale', 'Degen_King', 
  'MoonWalker', 'DiamondHands', 'Satoshi_Fan', 'BetGod', 
  'LuckBox_99', 'HighRoller_X'
];

const GAMES = ['Plinko', 'Dice', 'Mines', 'Crash', 'Slots', 'Roulette'];

const LiveFeed = () => {
  const [wins, setWins] = useState([]);
  const { theme } = useGameStore();

  useEffect(() => {
    // Generate initial wins
    const initial = Array.from({ length: 5 }, () => generateWin());
    setWins(initial);

    // Feed Loop
    const interval = setInterval(() => {
      const newWin = generateWin();
      setWins(prev => [newWin, ...prev].slice(0, 10)); // Keep last 10
    }, 4000 + Math.random() * 3000); // Random interval 4-7s

    return () => clearInterval(interval);
  }, []);

  const generateWin = () => {
    const isBigWin = Math.random() > 0.8;
    const bet = Math.floor(Math.random() * 500) + 10;
    const mult = isBigWin ? (Math.random() * 50 + 10).toFixed(2) : (Math.random() * 5 + 1.1).toFixed(2);
    const amount = bet * mult;
    
    return {
      id: Math.random(),
      user: FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)],
      game: GAMES[Math.floor(Math.random() * GAMES.length)],
      amount,
      mult,
      isBigWin
    };
  };

  return (
    <div className="hidden lg:flex flex-col w-72 bg-card/20 backdrop-blur-md border-r border-white/5 h-[calc(100vh-64px)] fixed left-0 top-16 overflow-hidden z-20">
       <div className="p-4 border-b border-white/5 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Live Wins</h3>
       </div>

       <div className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 flex flex-col gap-2 p-2">
             <AnimatePresence mode="popLayout">
                {wins.map((win) => (
                   <motion.div
                     key={win.id}
                     layout
                     initial={{ opacity: 0, x: -50 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, scale: 0.9 }}
                     className={cn(
                        "p-3 rounded-lg border border-white/5 flex flex-col gap-1 relative overflow-hidden",
                        win.isBigWin ? "bg-primary/10 border-primary/20" : "bg-black/20"
                     )}
                   >
                      {win.isBigWin && <div className="absolute top-0 right-0 w-8 h-8 bg-primary/20 blur-xl rounded-full" />}
                      
                      <div className="flex justify-between items-center text-xs">
                         <div className="flex items-center gap-2 text-white font-bold">
                            <User className="w-3 h-3 text-muted-foreground" />
                            {win.user}
                         </div>
                         <span className="text-muted-foreground">{win.game}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                         <span className={cn("text-sm font-mono font-bold", win.isBigWin ? "text-primary" : "text-green-400")}>
                            +{formatCurrency(win.amount)}
                         </span>
                         <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-muted-foreground">
                            {win.mult}x
                         </span>
                      </div>
                   </motion.div>
                ))}
             </AnimatePresence>
          </div>
       </div>
       
       <div className="p-4 border-t border-white/5 text-[10px] text-center text-muted-foreground opacity-50">
          <p>Created by Tharun</p>
       </div>
    </div>
  );
};

export default LiveFeed;
