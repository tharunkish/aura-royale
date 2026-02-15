import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { Trophy, Star, X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import useSound from '../../hooks/useSound';

const RANKS = [
  { name: 'Rookie', threshold: 0, color: 'text-gray-400' },
  { name: 'High Roller', threshold: 1000, color: 'text-emerald-400' },
  { name: 'VIP', threshold: 5000, color: 'text-purple-400' },
  { name: 'Whale', threshold: 25000, color: 'text-blue-400' },
  { name: 'Legend', threshold: 100000, color: 'text-yellow-400' },
  { name: 'AURA GOD', threshold: 1000000, color: 'text-rose-500' }
];

const LevelUpModal = () => {
  const { totalWagered } = useGameStore();
  const { playWin } = useSound();
  const [showModal, setShowModal] = useState(false);
  const [newRank, setNewRank] = useState(RANKS[0]);
  const prevRankIndex = useRef(0);

  useEffect(() => {
    // Find current rank index
    const currentRankIndex = [...RANKS].reverse().findIndex(r => totalWagered >= r.threshold);
    const actualIndex = currentRankIndex === -1 ? 0 : RANKS.length - 1 - currentRankIndex;

    if (actualIndex > prevRankIndex.current) {
       setNewRank(RANKS[actualIndex]);
       setShowModal(true);
       playWin();
       confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#ffd700', '#ffffff']
       });
       prevRankIndex.current = actualIndex;
    }
  }, [totalWagered, playWin]);

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
        >
           <motion.div
             initial={{ scale: 0.5, y: 50 }}
             animate={{ scale: 1, y: 0 }}
             exit={{ scale: 0.5, y: 50 }}
             className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-3xl border border-yellow-500/50 shadow-[0_0_100px_rgba(255,215,0,0.3)] text-center max-w-md w-full relative overflow-hidden"
           >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-yellow-500/10 animate-pulse-slow pointer-events-none" />
              
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-24 h-24 bg-yellow-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.6)]"
              >
                 <Trophy className="w-12 h-12 text-black" />
              </motion.div>

              <h2 className="text-4xl font-display font-bold text-white mb-2">RANK UP!</h2>
              <p className="text-muted-foreground text-sm uppercase tracking-widest mb-6">You have achieved the rank of</p>
              
              <div className={`text-3xl font-bold ${newRank.color} mb-8 drop-shadow-[0_0_10px_currentColor]`}>
                 {newRank.name}
              </div>

              <button 
                onClick={() => setShowModal(false)}
                className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xl uppercase tracking-widest rounded-xl shadow-lg transition-transform active:scale-95"
              >
                 CLAIM REWARD
              </button>

           </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelUpModal;
