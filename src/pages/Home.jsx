import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { 
  Dice5, Bomb, TrendingUp, Grid3x3, Club, CircleDashed, Zap, Swords, Rocket, 
  Target, ArrowUp, Gem, Trophy, Disc, Layers 
} from 'lucide-react';
import { cn } from '../lib/utils';

// --- Game Database ---
const GAMES = [
  // Originals
  { id: 'crash', title: 'Crash', category: 'Originals', icon: Rocket, color: 'from-orange-500 to-red-600', desc: 'Predict the multiplier crash.' },
  { id: 'dice', title: 'Dice', category: 'Originals', icon: Dice5, color: 'from-emerald-400 to-green-600', desc: 'Adjust your win chance.' },
  { id: 'mines', title: 'Mines', category: 'Originals', icon: Bomb, color: 'from-red-500 to-rose-700', desc: 'Sweep the grid for gems.' },
  { id: 'plinko', title: 'Plinko', category: 'Originals', icon: TrendingUp, color: 'from-pink-500 to-purple-600', desc: 'Pegs and multipliers.' },
  { id: 'limbo', title: 'Limbo', category: 'Originals', icon: Target, color: 'from-cyan-400 to-blue-600', desc: 'Target payout hunting.' },
  { id: 'hilo', title: 'HiLo', category: 'Originals', icon: ArrowUp, color: 'from-yellow-400 to-orange-500', desc: 'Higher or Lower?' },
  { id: 'dragon', title: 'Dragon Tower', category: 'Originals', icon: Trophy, color: 'from-amber-300 to-yellow-600', desc: 'Climb the tower.' },
  { id: 'diamonds', title: 'Diamonds', category: 'Originals', icon: Gem, color: 'from-violet-400 to-fuchsia-600', desc: 'Match colored gems.' },
  { id: 'slide', title: 'Slide', category: 'Originals', icon: Layers, color: 'from-indigo-400 to-blue-600', desc: 'Catch the multipliers.' },
  { id: 'wheel', title: 'Wheel', category: 'Originals', icon: Disc, color: 'from-lime-400 to-emerald-600', desc: 'Spin for glory.' },
  
  // Table Games
  { id: 'blackjack', title: 'Blackjack', category: 'Table', icon: Club, color: 'from-slate-700 to-slate-900', desc: 'Beat the dealer to 21.' },
  { id: 'roulette', title: 'Roulette', category: 'Table', icon: CircleDashed, color: 'from-red-700 to-black', desc: 'European single-zero.' },
  { id: 'poker', title: 'Poker', category: 'Table', icon: Swords, color: 'from-blue-700 to-slate-900', desc: 'Texas Hold\'em Heads Up.' },
  { id: 'baccarat', title: 'Baccarat', category: 'Table', icon: Layers, color: 'from-red-900 to-red-950', desc: 'Player vs Banker.' },
  
  // Slots
  { id: 'slots', title: 'Neon Slots', category: 'Slots', icon: Zap, color: 'from-yellow-400 to-amber-600', desc: '20-line video slots.' },
  { id: 'keno', title: 'Keno', category: 'Slots', icon: Grid3x3, color: 'from-purple-500 to-indigo-700', desc: 'Classic lottery draw.' },
];

const CATEGORIES = ['Originals', 'Table', 'Slots'];

// --- 3D Card Component ---
const GameCard = ({ game, onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX - width / 2);
    y.set(mouseY - height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative h-64 w-full rounded-2xl cursor-pointer group"
    >
      <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-br opacity-80 transition-all duration-500 group-hover:opacity-100 shadow-2xl border border-white/5", game.color)}>
         {/* Inner Glow */}
         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-white/10 rounded-2xl" />
         
         {/* Icon Watermark */}
         <game.icon className="absolute -right-8 -top-8 w-48 h-48 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700 ease-out" />
         
         {/* Content */}
         <div className="absolute bottom-0 left-0 p-6 w-full">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg shadow-lg">
                  <game.icon className="w-6 h-6 text-white" />
               </div>
               <span className="text-[10px] font-bold uppercase tracking-widest bg-black/40 px-2 py-1 rounded text-white/80 backdrop-blur-sm">
                  {game.category}
               </span>
            </div>
            <h3 className="text-2xl font-display font-black text-white mb-1 tracking-wide group-hover:translate-x-2 transition-transform">{game.title}</h3>
            <p className="text-sm text-white/70 line-clamp-1 group-hover:text-white transition-colors">{game.desc}</p>
         </div>

         {/* Hover Border Beam */}
         <div className="absolute inset-0 rounded-2xl ring-1 ring-white/0 group-hover:ring-white/50 transition-all duration-500" />
      </div>
    </motion.div>
  );
};

const HeroSection = ({ onPlay }) => {
  return (
    <div className="relative w-full h-[400px] rounded-[3rem] overflow-hidden mb-12 group">
       <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?q=80&w=2835&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-[10s] ease-linear group-hover:scale-110" />
       <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
       
       <div className="absolute inset-0 p-12 flex flex-col justify-center max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 mb-4"
          >
             <span className="px-3 py-1 bg-primary text-black font-bold text-xs rounded-full uppercase tracking-widest">Featured</span>
             <span className="text-primary font-mono text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> 
                Live RTP: 99.2%
             </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-6xl md:text-8xl font-display font-black text-white mb-6 leading-[0.8] tracking-tighter"
          >
             CRASH
             <br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-white opacity-50">VELOCITY</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl text-muted-foreground mb-8 max-w-md font-light"
          >
             The ultimate test of nerves. Watch the multiplier climb exponentially. Cash out before the rocket explodes.
          </motion.p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPlay('crash')}
            className="w-fit px-8 py-4 bg-white text-black font-bold text-lg rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] transition-all flex items-center gap-2"
          >
             <Rocket className="w-5 h-5 fill-black" />
             PLAY NOW
          </motion.button>
       </div>
    </div>
  );
};

const Home = () => {
  const setActiveGame = useGameStore((state) => state.setActiveGame);

  return (
    <div className="pb-24">
       <HeroSection onPlay={setActiveGame} />
       
       <div className="space-y-16">
          {CATEGORIES.map((category) => (
             <section key={category}>
                <div className="flex items-center gap-4 mb-6">
                   <h2 className="text-3xl font-display font-bold text-white tracking-wide">{category}</h2>
                   <div className="h-px flex-1 bg-white/10" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                   {GAMES.filter(g => g.category === category).map((game) => (
                      <GameCard 
                        key={game.id} 
                        game={game} 
                        onClick={() => setActiveGame(game.id)} 
                      />
                   ))}
                </div>
             </section>
          ))}
       </div>
    </div>
  );
};

export default Home;
