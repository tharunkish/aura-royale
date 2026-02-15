import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useGameStore = create(
  persist(
    (set, get) => ({
      balance: 1000,
      xp: 0,
      level: 1,
      activeGame: null,
      volume: 0.5,
      history: [],
      
      // Stats for Vault
      totalWagered: 0,
      totalWon: 0,
      gamesPlayed: 0,
      highestWin: 0,
      profitHistory: [{ time: Date.now(), balance: 1000 }], // Initial point
      
      // Theme
      theme: 'default', // default, cyber, emerald, solar, frost
      setTheme: (newTheme) => set({ theme: newTheme }),

      // Actions
      setBalance: (amount) => {
         const newBalance = Number(amount);
         set((state) => ({ 
             balance: newBalance,
             profitHistory: [...state.profitHistory.slice(-19), { time: Date.now(), balance: newBalance }]
         }));
      },
      
      addBalance: (amount) => set((state) => {
        const newBalance = state.balance + amount;
        return { 
          balance: newBalance,
          totalWon: state.totalWon + amount,
          highestWin: Math.max(state.highestWin, amount),
          history: [...state.history.slice(-9), { type: 'win', amount, timestamp: Date.now() }],
          profitHistory: [...state.profitHistory.slice(-19), { time: Date.now(), balance: newBalance }]
        };
      }),

      subtractBalance: (amount) => {
        const currentBalance = get().balance;
        if (currentBalance < amount) return false;
        
        set((state) => {
          const newBalance = state.balance - amount;
          return { 
             balance: newBalance,
             totalWagered: state.totalWagered + amount,
             gamesPlayed: state.gamesPlayed + 1,
             xp: state.xp + (amount * 0.1), // 10% of bet becomes XP
             profitHistory: [...state.profitHistory.slice(-19), { time: Date.now(), balance: newBalance }]
          };
        });
        return true;
      },

      setActiveGame: (gameId) => set({ activeGame: gameId }),
      
      setVolume: (vol) => set({ volume: vol }),

      claimDaily: () => {
         const current = get().balance;
         if (current < 100) {
            set((state) => {
               const newBalance = state.balance + 1000;
               return {
                  balance: newBalance,
                  profitHistory: [...state.profitHistory.slice(-19), { time: Date.now(), balance: newBalance }]
               };
            });
            return true;
         }
         return false;
      },

      resetProgress: () => set({
         balance: 1000,
         xp: 0,
         level: 1,
         history: [],
         totalWagered: 0,
         totalWon: 0,
         gamesPlayed: 0,
         highestWin: 0,
         profitHistory: [{ time: Date.now(), balance: 1000 }]
      })
    }),
    {
      name: 'aura-royale-storage',
      partialize: (state) => ({ 
        balance: state.balance, 
        xp: state.xp, 
        level: state.level,
        volume: state.volume,
        totalWagered: state.totalWagered,
        totalWon: state.totalWon,
        gamesPlayed: state.gamesPlayed,
        highestWin: state.highestWin,
        profitHistory: state.profitHistory,
        theme: state.theme
      }),
    }
  )
);
