import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Wallet, Trophy, Search, Menu, X, Rocket, Crown } from 'lucide-react';
import { cn } from '../../lib/utils';

const DockItem = ({ icon: Icon, label, isActive, onClick }) => {
  return (
    <motion.button
      whileHover={{ y: -5, scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300",
        isActive 
          ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(255,215,0,0.3)]" 
          : "text-muted-foreground hover:text-white hover:bg-white/5"
      )}
    >
      <Icon className={cn("w-6 h-6", isActive && "fill-current")} />
      {isActive && (
        <motion.div 
          layoutId="dock-dot"
          className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full"
        />
      )}
    </motion.button>
  );
};

const Dock = ({ onOpenVault, onToggleFeed }) => {
  const { activeGame, setActiveGame } = useGameStore();
  const [activeTab, setActiveTab] = useState('home');

  const handleNav = (id) => {
    setActiveTab(id);
    if (id === 'home') setActiveGame(null);
    if (id === 'vault') onOpenVault();
    if (id === 'social') onToggleFeed();
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-2 px-4 py-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl relative"
      >
        <DockItem 
          icon={Home} 
          isActive={!activeGame && activeTab === 'home'} 
          onClick={() => handleNav('home')} 
        />
        <DockItem 
          icon={Rocket} 
          isActive={!!activeGame} 
          onClick={() => {}} // Just visual indicator for active game
        />
        <div className="w-px h-8 bg-white/10 mx-2" />
        <DockItem 
          icon={Wallet} 
          isActive={activeTab === 'vault'} 
          onClick={() => handleNav('vault')} 
        />
        <DockItem 
          icon={Trophy} 
          isActive={activeTab === 'rewards'} 
          onClick={() => handleNav('rewards')} 
        />
        <DockItem 
          icon={Menu} 
          isActive={activeTab === 'social'} 
          onClick={() => handleNav('social')} 
        />
        
        {/* Branding */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white/20 whitespace-nowrap font-medium tracking-widest uppercase pointer-events-none">
           Created by Tharun
        </div>
      </motion.div>
    </div>
  );
};

export default Dock;
