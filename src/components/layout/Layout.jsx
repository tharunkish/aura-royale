import Dock from './Dock';
import SocialDrawer from './SocialDrawer';
import Header from './Header'; // Keep standard header for balance display only? No, let's integrate.
import LevelUpModal from '../ui/LevelUpModal';
import Vault from './Vault'; // Need to conditionally render Vault now
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useEffect, useState } from 'react';
import { Coins, Crown, Wallet } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

// Minimal Top Bar for Balance & Profile
const TopBar = ({ onOpenVault }) => {
  const { balance } = useGameStore();
  
  return (
    <div className="fixed top-0 left-0 right-0 h-16 z-40 flex justify-between items-center px-6 pointer-events-none">
       {/* Logo */}
       <div className="pointer-events-auto flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5">
          <Crown className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" />
          <span className="font-display font-bold text-white tracking-widest text-sm">AURA</span>
       </div>

       {/* Balance Pill */}
       <motion.button 
         whileHover={{ scale: 1.05 }}
         whileTap={{ scale: 0.95 }}
         onClick={onOpenVault}
         className="pointer-events-auto flex items-center gap-3 bg-black/60 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10 shadow-lg hover:border-primary/30 transition-colors group"
       >
          <div className="flex flex-col items-end leading-none">
             <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider group-hover:text-primary transition-colors">Balance</span>
             <span className="font-mono font-bold text-white text-lg">{formatCurrency(balance)}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary transition-colors">
             <Wallet className="w-4 h-4 text-primary group-hover:text-black transition-colors" />
          </div>
       </motion.button>
    </div>
  );
};

const Layout = ({ children }) => {
  const { theme } = useGameStore();
  const [showVault, setShowVault] = useState(false);
  const [showSocial, setShowSocial] = useState(false);

  useEffect(() => {
    document.body.setAttribute('data-theme', theme || 'default');
  }, [theme]);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden transition-colors duration-500 selection:bg-primary/30">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.03),transparent_70%)]" />
         <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]" />
      </div>
      
      {/* UI Layers */}
      <TopBar onOpenVault={() => setShowVault(true)} />
      
      <Dock 
        onOpenVault={() => setShowVault(true)}
        onToggleFeed={() => setShowSocial(!showSocial)}
      />
      
      <SocialDrawer 
        isOpen={showSocial} 
        onClose={() => setShowSocial(false)} 
      />
      
      <AnimatePresence>
         {showVault && <Vault onClose={() => setShowVault(false)} />}
      </AnimatePresence>
      
      <LevelUpModal />

      {/* Main Content Area */}
      <motion.main 
        layout
        className="relative z-10 w-full h-screen overflow-y-auto overflow-x-hidden pt-20 pb-32 px-4 scrollbar-hide"
      >
        <div className="container mx-auto max-w-7xl">
           {children}
        </div>
      </motion.main>
    </div>
  );
};

export default Layout;
