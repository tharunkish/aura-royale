import Header from './Header';
import LevelUpModal from '../ui/LevelUpModal';
import LiveFeed from './LiveFeed';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { useEffect } from 'react';

const Layout = ({ children }) => {
  const { theme } = useGameStore();

  useEffect(() => {
    // Apply theme to body
    document.body.setAttribute('data-theme', theme || 'default');
  }, [theme]);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden transition-colors duration-500">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,rgba(var(--foreground),0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--foreground),0.05)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Animated Light Blobs - Dynamic Colors */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[150px] rounded-full opacity-30 animate-pulse-slow transition-colors duration-500" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-secondary-foreground/10 blur-[150px] rounded-full opacity-30 animate-pulse-slow transition-colors duration-500" />
      
      {/* Header */}
      <Header />
      
      {/* Sidebar Feed */}
      <LiveFeed />
      
      {/* Global Modals */}
      <LevelUpModal />

      {/* Main Content */}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 pt-24 px-4 container mx-auto lg:pl-72"
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;
