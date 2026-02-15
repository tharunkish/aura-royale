import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { 
  Dice5, 
  Bomb, 
  TrendingUp, 
  Grid3x3, 
  Club, 
  CircleDashed, 
  Zap, 
  Swords,
  Rocket
} from 'lucide-react';

const games = [
  { id: 'crash', title: 'Crash', description: 'Cash out before the crash.', icon: Rocket, color: 'text-orange-500' },
  { id: 'dice', title: 'Dice', description: 'Slide to multiply.', icon: Dice5, color: 'text-emerald-400' },
  { id: 'mines', title: 'Mines', description: 'Avoid the traps.', icon: Bomb, color: 'text-red-500' },
  { id: 'plinko', title: 'Plinko', description: 'Drop the ball.', icon: TrendingUp, color: 'text-pink-500' },
  { id: 'keno', title: 'Keno', description: 'Pick your numbers.', icon: Grid3x3, color: 'text-purple-500' },
  { id: 'blackjack', title: 'Blackjack', description: 'Beat the dealer.', icon: Club, color: 'text-white' },
  { id: 'roulette', title: 'Roulette', description: 'Spin the wheel.', icon: CircleDashed, color: 'text-green-500' },
  { id: 'slots', title: 'Slots', description: 'Neon jackpots.', icon: Zap, color: 'text-yellow-400' },
  { id: 'poker', title: 'Poker', description: 'Texas Hold\'em.', icon: Swords, color: 'text-blue-500' },
];

const GameCard = ({ title, description, icon: Icon, onClick, color }) => {
  return (
    <motion.button
      whileHover={{ y: -5, boxShadow: '0 20px 40px -15px rgba(255, 215, 0, 0.1)' }}
      whileTap={{ scale: 0.98 }}
      className="relative w-full h-48 rounded-3xl bg-card border border-white/5 hover:border-primary/20 overflow-hidden text-left p-6 transition-all group"
      onClick={onClick}
    >
      <div className="absolute top-[-20%] right-[-10%] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12 scale-150 pointer-events-none">
        <Icon className="w-48 h-48" />
      </div>
      
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className={`p-3 rounded-2xl bg-white/5 w-fit backdrop-blur-sm border border-white/5 group-hover:bg-white/10 transition-colors`}>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
        
        <div>
           <h3 className="text-2xl font-display font-bold text-white mb-1 group-hover:text-primary transition-colors tracking-wide">{title}</h3>
           <p className="text-sm text-muted-foreground group-hover:text-gray-400 transition-colors font-medium">{description}</p>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
    </motion.button>
  );
};

const Home = () => {
  const setActiveGame = useGameStore((state) => state.setActiveGame);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 ml-0 lg:ml-72 transition-all duration-300">
      <div className="mb-16 text-center space-y-4">
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="inline-block"
        >
           <h1 className="text-5xl md:text-8xl font-display font-black tracking-tighter mb-2 bg-gradient-to-br from-white via-gray-200 to-gray-600 bg-clip-text text-transparent drop-shadow-2xl">
             AURA ROYALE
           </h1>
           <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        </motion.div>
        
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-light">
          The new standard in high-stakes digital entertainment. <br />
          <span className="text-primary font-bold">Provably Fair. Instantly Rewarding.</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {games.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
             <GameCard 
               {...game}
               onClick={() => setActiveGame(game.id)}
             />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
