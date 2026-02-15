import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { formatCurrency, cn } from '../../lib/utils';
import { Coins, LogOut, Volume2, VolumeX, Crown, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';
import Vault from './Vault';

const Header = () => {
  const { balance, activeGame, setActiveGame, volume, setVolume, claimDaily } = useGameStore();
  const [prevBalance, setPrevBalance] = useState(balance);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);

  useEffect(() => {
    if (balance !== prevBalance) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      setPrevBalance(balance);
      return () => clearTimeout(timer);
    }
  }, [balance, prevBalance]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <motion.div 
            className="flex items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveGame(null)}
          >
            <Crown className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" />
            <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-amber-200 bg-clip-text text-transparent">
              AURA
            </h1>
          </motion.div>
        </div>

        <div className="flex items-center gap-4">
          {/* Daily Bonus if Broke */}
          <AnimatePresence>
            {balance < 100 && (
              <motion.button
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onClick={claimDaily}
                className="px-4 py-1.5 bg-gradient-to-r from-green-600 to-emerald-500 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              >
                Claim +$1,000
              </motion.button>
            )}
          </AnimatePresence>

          {/* Balance Display - Click to Open Vault */}
          <motion.div 
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             onClick={() => setIsVaultOpen(true)}
             className={cn(
               "relative group cursor-pointer flex items-center gap-3 px-4 py-2 bg-secondary rounded-full border border-white/5 transition-all duration-300 hover:border-primary/30",
               isAnimating && "border-primary/50 shadow-[0_0_20px_rgba(255,215,0,0.2)]"
             )}
          >
            <Wallet className="w-5 h-5 text-primary" />
            <span className="font-mono text-lg font-bold text-white tracking-wide">
              {formatCurrency(balance)}
            </span>
            {/* Tooltip hint */}
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-[10px] uppercase font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
               Open Vault
            </div>
          </motion.div>

          {/* Controls */}
          <button 
            onClick={() => setVolume(volume > 0 ? 0 : 0.5)}
            className="p-2 hover:bg-white/5 rounded-full text-muted-foreground hover:text-white transition-colors"
          >
            {volume > 0 ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          {activeGame && (
             <button 
               onClick={() => setActiveGame(null)}
               className="p-2 hover:bg-red-500/10 rounded-full text-muted-foreground hover:text-red-500 transition-colors"
             >
               <LogOut className="w-5 h-5" />
             </button>
          )}
        </div>
      </header>

      {/* Vault Modal */}
      <AnimatePresence>
         {isVaultOpen && <Vault onClose={() => setIsVaultOpen(false)} />}
      </AnimatePresence>
    </>
  );
};

export default Header;
