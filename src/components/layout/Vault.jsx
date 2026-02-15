import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, TrendingUp, History, RefreshCcw, Save, Palette } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { formatCurrency, cn } from '../../lib/utils';
import { useState } from 'react';

const THEMES = [
  { id: 'default', name: 'Onyx Gold', color: 'bg-[#ffd700]' },
  { id: 'cyber', name: 'Cyber Neon', color: 'bg-[#db00b0]' },
  { id: 'emerald', name: 'Forest', color: 'bg-[#34d399]' },
  { id: 'solar', name: 'Solar Flare', color: 'bg-[#f97316]' },
  { id: 'frost', name: 'Frost', color: 'bg-[#38bdf8]' },
];

const Vault = ({ onClose }) => {
  const store = useGameStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, themes
  const [adminBalance, setAdminBalance] = useState(store.balance);

  const netProfit = store.balance - 1000;
  
  const handleAdminSave = () => {
    store.setBalance(Number(adminBalance));
  };

  const handleReset = () => {
    if (confirm("WARNING: This will wipe all progress. Are you sure?")) {
       store.resetProgress();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="w-full max-w-5xl h-[90vh] bg-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-primary/10 rounded-xl">
                    <Trophy className="w-6 h-6 text-primary" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">The Vault</h2>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Financial Dashboard</p>
                 </div>
              </div>
              
              {/* Tabs */}
              <div className="flex gap-2 bg-black/20 p-1 rounded-lg">
                 <button 
                   onClick={() => setActiveTab('dashboard')}
                   className={cn("px-4 py-2 rounded-md text-sm font-bold transition-all", activeTab === 'dashboard' ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white")}
                 >
                    Dashboard
                 </button>
                 <button 
                   onClick={() => setActiveTab('themes')}
                   className={cn("px-4 py-2 rounded-md text-sm font-bold transition-all flex gap-2 items-center", activeTab === 'themes' ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white")}
                 >
                    <Palette className="w-4 h-4" /> Skins
                 </button>
              </div>
           </div>

           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-6 h-6 text-muted-foreground" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
           
           {activeTab === 'dashboard' ? (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2 bg-card/30 rounded-2xl border border-white/5 p-6 flex flex-col">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase mb-6">Net Worth Performance</h3>
                  <div className="flex-1 min-h-[300px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={store.profitHistory}>
                           <defs>
                              <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <XAxis dataKey="time" hide />
                           <YAxis hide domain={['auto', 'auto']} />
                           <Tooltip 
                              contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                              itemStyle={{ color: '#fff' }}
                              formatter={(value) => formatCurrency(value)}
                              labelFormatter={() => ''}
                           />
                           <Area 
                              type="monotone" 
                              dataKey="balance" 
                              stroke="var(--primary)" 
                              strokeWidth={2}
                              fillOpacity={1} 
                              fill="url(#colorBal)" 
                           />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                     <div className="bg-card/50 p-6 rounded-2xl border border-white/5">
                        <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Net Profit</div>
                        <div className={cn("text-3xl font-mono font-bold", netProfit >= 0 ? "text-green-400" : "text-red-500")}>
                           {netProfit >= 0 ? "+" : ""}{formatCurrency(netProfit)}
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-card/30 p-4 rounded-2xl border border-white/5">
                           <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Total Wagered</div>
                           <div className="text-lg font-mono font-bold text-foreground">{formatCurrency(store.totalWagered)}</div>
                        </div>
                        <div className="bg-card/30 p-4 rounded-2xl border border-white/5">
                           <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Highest Win</div>
                           <div className="text-lg font-mono font-bold text-primary">{formatCurrency(store.highestWin)}</div>
                        </div>
                     </div>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
                     <button 
                       onClick={() => setIsAdmin(!isAdmin)}
                       className="w-full p-4 flex justify-between items-center text-xs font-bold uppercase hover:bg-white/5 transition-colors"
                     >
                        <span>Developer Terminal</span>
                        <span>{isAdmin ? 'ON' : 'OFF'}</span>
                     </button>
                     <AnimatePresence>
                        {isAdmin && (
                           <motion.div 
                             initial={{ height: 0 }}
                             animate={{ height: 'auto' }}
                             exit={{ height: 0 }}
                             className="p-4 border-t border-white/10 space-y-4"
                           >
                              <div>
                                 <label className="text-[10px] uppercase text-muted-foreground font-bold block mb-2">Set Balance</label>
                                 <div className="flex gap-2">
                                    <input 
                                      type="number" 
                                      value={adminBalance}
                                      onChange={(e) => setAdminBalance(e.target.value)}
                                      className="w-full bg-black border border-white/20 rounded px-3 py-2 font-mono text-sm focus:border-primary focus:outline-none"
                                    />
                                    <button onClick={handleAdminSave} className="bg-white/10 hover:bg-white/20 p-2 rounded">
                                       <Save className="w-4 h-4" />
                                    </button>
                                 </div>
                              </div>
                              <button 
                                onClick={handleReset}
                                className="w-full py-3 bg-red-900/20 text-red-500 border border-red-500/30 rounded-lg text-xs font-bold uppercase hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2"
                              >
                                 <RefreshCcw className="w-3 h-3" /> Factory Reset Profile
                              </button>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
               </div>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {THEMES.map(theme => (
                   <motion.button
                     key={theme.id}
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     onClick={() => store.setTheme(theme.id)}
                     className={cn(
                        "relative h-48 rounded-2xl border-2 transition-all overflow-hidden group text-left p-6 flex flex-col justify-end",
                        store.theme === theme.id ? "border-primary ring-2 ring-primary/20" : "border-white/10 hover:border-white/30"
                     )}
                   >
                      {/* Preview Background */}
                      <div className={cn("absolute inset-0 opacity-20 transition-opacity group-hover:opacity-30", theme.color)} />
                      
                      {/* Active Indicator */}
                      {store.theme === theme.id && (
                         <div className="absolute top-4 right-4 bg-primary text-black text-xs font-bold px-2 py-1 rounded-full uppercase">
                            Active
                         </div>
                      )}

                      <h3 className="text-2xl font-bold text-white relative z-10">{theme.name}</h3>
                      <div className={cn("h-1 w-12 mt-2 rounded-full", theme.color.replace('bg-', 'bg-opacity-100 bg-'))} />
                   </motion.button>
                ))}
             </div>
           )}

        </div>

      </div>
    </motion.div>
  );
};

export default Vault;
