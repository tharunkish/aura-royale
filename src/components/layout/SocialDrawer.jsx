import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Trophy, X, ChevronRight } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

const FAKE_USERS = [
  'Rocket_Man', 'CryptoCat', 'AuraWhale', 'Degen_King', 
  'MoonWalker', 'DiamondHands', 'Satoshi_Fan', 'BetGod', 
  'LuckBox_99', 'HighRoller_X'
];

const GAMES = ['Plinko', 'Dice', 'Mines', 'Crash', 'Slots', 'Roulette'];

const SocialDrawer = ({ isOpen, onClose }) => {
  const [wins, setWins] = useState([]);

  useEffect(() => {
    // Initial Population
    setWins(Array.from({ length: 8 }, () => generateWin()));

    // Live Loop
    const interval = setInterval(() => {
      setWins(prev => [generateWin(), ...prev].slice(0, 15));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const generateWin = () => {
    const isBigWin = Math.random() > 0.85;
    const bet = Math.floor(Math.random() * 500) + 10;
    const mult = isBigWin ? (Math.random() * 50 + 10).toFixed(2) : (Math.random() * 5 + 1.1).toFixed(2);
    
    return {
      id: Math.random(),
      user: FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)],
      game: GAMES[Math.floor(Math.random() * GAMES.length)],
      amount: bet * mult,
      mult,
      isBigWin,
      timestamp: Date.now()
    };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
          
          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-[#0a0a0a]/95 border-l border-white/10 backdrop-blur-xl z-50 flex flex-col shadow-2xl"
          >
             {/* Header */}
             <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                   <h3 className="font-display font-bold text-white tracking-wide">LIVE FEED</h3>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                   <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
             </div>

             {/* Feed */}
             <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                   {wins.map((win) => (
                      <motion.div
                        key={win.id}
                        layout
                        initial={{ opacity: 0, x: 20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={cn(
                           "p-3 rounded-xl border relative overflow-hidden group hover:bg-white/5 transition-colors",
                           win.isBigWin 
                             ? "bg-gradient-to-r from-primary/10 to-transparent border-primary/30" 
                             : "bg-card/40 border-white/5"
                        )}
                      >
                         {win.isBigWin && (
                            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 blur-[40px] rounded-full pointer-events-none" />
                         )}
                         
                         <div className="flex justify-between items-start mb-1 relative z-10">
                            <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                                  <User className="w-3 h-3 text-muted-foreground" />
                               </div>
                               <span className="text-xs font-bold text-white">{win.user}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{win.game}</span>
                         </div>

                         <div className="flex justify-between items-end relative z-10 pl-8">
                            <span className={cn(
                               "font-mono font-bold", 
                               win.isBigWin ? "text-primary text-lg drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]" : "text-green-400 text-sm"
                            )}>
                               +{formatCurrency(win.amount)}
                            </span>
                            <span className={cn(
                               "text-[10px] px-1.5 py-0.5 rounded font-bold",
                               win.isBigWin ? "bg-primary text-black" : "bg-white/10 text-muted-foreground"
                            )}>
                               {win.mult}x
                            </span>
                         </div>
                      </motion.div>
                   ))}
                </AnimatePresence>
             </div>

             {/* Footer Branding */}
             <div className="p-4 border-t border-white/10 bg-black/40">
                <div className="flex justify-center items-center gap-2 opacity-30 hover:opacity-100 transition-opacity duration-500 cursor-default">
                   <Crown className="w-3 h-3" />
                   <span className="text-[10px] font-display font-bold uppercase tracking-[0.2em]">Tharun Engine</span>
                </div>
             </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SocialDrawer;
