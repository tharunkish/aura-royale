import { motion } from 'framer-motion';

const GameCard = ({ title, description, icon: Icon, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      className="relative group cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-card to-black p-[1px] shadow-lg hover:shadow-primary/20 transition-all duration-500"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent translate-x-[-100%] group-hover:animate-shine z-10" />
      
      <div className="relative h-full bg-black/90 backdrop-blur-sm rounded-2xl p-6 flex flex-col justify-between items-start border border-white/5 group-hover:border-primary/50 transition-colors z-20">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
          <Icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
        </div>
        
        <div>
          <h3 className="text-xl font-display font-bold text-white mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground group-hover:text-gray-300 transition-colors">
            {description}
          </p>
        </div>

        <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full group-hover:bg-primary/10 transition-colors pointer-events-none" />
      </div>
    </motion.div>
  );
};

export default GameCard;
