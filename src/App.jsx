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
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { activeGame } = useGameStore();

  const renderGame = () => {
    switch (activeGame) {
      case 'dice': return <Dice />;
      case 'mines': return <Mines />;
      case 'plinko': return <Plinko />;
      case 'keno': return <Keno />;
      case 'blackjack': return <Blackjack />;
      case 'roulette': return <Roulette />;
      case 'slots': return <Slots />;
      case 'poker': return <Poker />;
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
