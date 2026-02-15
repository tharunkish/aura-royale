import Layout from './components/layout/Layout';
import { useGameStore } from './store/gameStore';
import Home from './pages/Home';
import Dice from './components/games/Dice';
import Mines from './components/games/Mines';
import Plinko from './components/games/Plinko';
import Keno from './components/games/Keno';
import Blackjack from './components/games/Blackjack';
import Roulette from './components/games/Roulette';
import Slots from './components/games/Slots';
import Poker from './components/games/Poker';
import Crash from './components/games/Crash';
import Limbo from './components/games/Limbo';
import HiLo from './components/games/HiLo';
import DragonTower from './components/games/DragonTower';
import Diamonds from './components/games/Diamonds';
import Baccarat from './components/games/Baccarat';
import Wheel from './components/games/Wheel';
import Slide from './components/games/Slide';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { activeGame } = useGameStore();

  const renderGame = () => {
    switch (activeGame) {
      case 'crash': return <Crash />;
      case 'dice': return <Dice />;
      case 'mines': return <Mines />;
      case 'plinko': return <Plinko />;
      case 'keno': return <Keno />;
      case 'blackjack': return <Blackjack />;
      case 'roulette': return <Roulette />;
      case 'slots': return <Slots />;
      case 'poker': return <Poker />;
      case 'limbo': return <Limbo />;
      case 'hilo': return <HiLo />;
      case 'dragon': return <DragonTower />;
      case 'diamonds': return <Diamonds />;
      case 'baccarat': return <Baccarat />;
      case 'wheel': return <Wheel />;
      case 'slide': return <Slide />;
      default: return <Home />;
    }
  };

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeGame || 'home'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {renderGame()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

export default App;
