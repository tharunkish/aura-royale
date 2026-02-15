import { useRef, useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion } from 'framer-motion';
import { Settings, Play, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

// Constants
const ROWS = 16;
const PEGS_START_Y = 100;
const ROW_SPACING = 35;
const PEG_RADIUS = 3;
const BALL_RADIUS = 6;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;
const GRAVITY = 0.25;
const FRICTION = 0.99;
const RESTITUTION = 0.6; // Bounciness

const Plinko = () => {
  const { balance, subtractBalance, addBalance } = useGameStore();
  const canvasRef = useRef(null);
  const [betAmount, setBetAmount] = useState(10);
  const [risk, setRisk] = useState('Medium'); // Low, Medium, High
  const [rowCount, setRowCount] = useState(16);
  const ballsRef = useRef([]);
  const pegsRef = useRef([]);
  const multipliersRef = useRef([]);
  const engineRef = useRef(null);

  // Initialize Pegs and Multipliers
  useEffect(() => {
    // Generate Pegs
    const pegs = [];
    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col <= row + 2; col++) {
        // Calculate Peg Position
        // Center the pyramid
        const x = CANVAS_WIDTH / 2 + (col - (row + 2) / 2) * ROW_SPACING;
        const y = PEGS_START_Y + row * ROW_SPACING;
        pegs.push({ x, y, r: PEG_RADIUS });
      }
    }
    pegsRef.current = pegs;

    // Generate Multipliers (simplified logic)
    // In a real game, risk would change this distribution
    const count = rowCount + 1;
    // Simple symmetric multipliers logic based on risk
    const baseMults = {
      'Low': [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6], // Placeholder
      'Medium': [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110], // 16 rows
      'High': [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000]
    };
    
    // Just map to available slots for now
    // Create buckets
    const buckets = [];
    for (let i = 0; i < rowCount + 1; i++) {
        const x = CANVAS_WIDTH / 2 + (i - (rowCount + 1) / 2) * ROW_SPACING;
        const y = PEGS_START_Y + rowCount * ROW_SPACING + ROW_SPACING;
        // Logic for multiplier value based on distance from center
        const centerDist = Math.abs(i - rowCount / 2);
        let val = 1 + (centerDist * centerDist * (risk === 'High' ? 0.3 : 0.1)); 
        if (risk === 'High' && centerDist > rowCount/2 - 2) val *= 5; // boost edges
        
        buckets.push({ 
           x, y, w: ROW_SPACING - 4, h: 30, 
           val: parseFloat(val.toFixed(1)) 
        });
    }
    multipliersRef.current = buckets;

  }, [rowCount, risk]);

  // Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const update = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Draw Pegs
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (const peg of pegsRef.current) {
         ctx.beginPath();
         ctx.arc(peg.x, peg.y, peg.r, 0, Math.PI * 2);
         ctx.fill();
      }

      // Draw Multipliers
      for (const m of multipliersRef.current) {
         ctx.fillStyle = risk === 'High' ? '#ef4444' : '#eab308';
         if (m.val < 1) ctx.fillStyle = '#3f3f46';
         
         ctx.beginPath();
         // Rounded rect
         ctx.roundRect(m.x - m.w/2, m.y, m.w, m.h, 4);
         ctx.fill();
         
         ctx.fillStyle = '#000';
         ctx.font = 'bold 10px monospace';
         ctx.textAlign = 'center';
         ctx.fillText(`${m.val}x`, m.x, m.y + 18);
      }

      // Update & Draw Balls
      for (let i = ballsRef.current.length - 1; i >= 0; i--) {
        const ball = ballsRef.current[i];
        
        // Physics
        ball.dy += GRAVITY;
        ball.dy *= FRICTION;
        ball.dx *= FRICTION;
        
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Collision with Pegs
        for (const peg of pegsRef.current) {
           const dx = ball.x - peg.x;
           const dy = ball.y - peg.y;
           const dist = Math.sqrt(dx * dx + dy * dy);
           
           if (dist < ball.r + peg.r) {
              // Collision Normal
              const nx = dx / dist;
              const ny = dy / dist;
              
              // Reflect Velocity
              // v' = v - 2 * (v . n) * n
              const dot = ball.dx * nx + ball.dy * ny;
              ball.dx = (ball.dx - 2 * dot * nx) * RESTITUTION;
              ball.dy = (ball.dy - 2 * dot * ny) * RESTITUTION;
              
              // Push out of collision
              const overlap = (ball.r + peg.r) - dist;
              ball.x += nx * overlap;
              ball.y += ny * overlap;
              
              // Add some randomness (Juice)
              ball.dx += (Math.random() - 0.5) * 0.5;
           }
        }

        // Collision with Bottom (Buckets)
        const bucketY = PEGS_START_Y + rowCount * ROW_SPACING + ROW_SPACING;
        if (ball.y > bucketY) {
           // Find which bucket
           // Simple x check
           let hit = false;
           for (const m of multipliersRef.current) {
              if (Math.abs(ball.x - m.x) < m.w / 2 + 5) {
                 // Hit this bucket
                 const win = ball.bet * m.val;
                 addBalance(win);
                 // Remove ball
                 ballsRef.current.splice(i, 1);
                 hit = true;
                 break;
              }
           }
           if (!hit) {
              // Should effectively be impossible if buckets cover width
               ballsRef.current.splice(i, 1);
           }
           continue; 
        }

        // Draw Ball
        ctx.fillStyle = '#ef4444'; // Red ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();
      }

      engineRef.current = requestAnimationFrame(update);
    };
    
    engineRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(engineRef.current);
  }, [rowCount, risk, addBalance]);

  const dropBall = () => {
    if (betAmount > balance) return;
    if (!subtractBalance(betAmount)) return;

    // Add Ball
    // Randomize start x slightly to hit different paths
    const startX = CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 10;
    ballsRef.current.push({
      x: startX,
      y: 50,
      dx: 0,
      dy: 0,
      r: BALL_RADIUS,
      bet: betAmount
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto p-6">
      
      {/* Controls */}
      <div className="w-full lg:w-1/3 space-y-6 bg-card/50 backdrop-blur-xl p-6 rounded-3xl border border-white/5 h-fit">
         
         <div className="space-y-2">
            <label className="text-muted-foreground text-sm font-bold uppercase">Bet Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
               <input 
                 type="number" 
                 value={betAmount} 
                 onChange={(e) => setBetAmount(Number(e.target.value))}
                 className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-lg font-mono font-bold text-white focus:outline-none focus:border-primary/50 transition-all"
               />
            </div>
         </div>

         <div className="space-y-2">
            <label className="text-muted-foreground text-sm font-bold uppercase">Risk Level</label>
            <div className="grid grid-cols-3 gap-2">
               {['Low', 'Medium', 'High'].map(r => (
                 <button
                   key={r}
                   onClick={() => setRisk(r)}
                   className={cn(
                     "py-2 rounded-lg text-sm font-bold transition-all",
                     risk === r 
                       ? "bg-primary text-black shadow-[0_0_15px_rgba(255,215,0,0.3)]" 
                       : "bg-secondary text-muted-foreground hover:bg-white/5"
                   )}
                 >
                   {r}
                 </button>
               ))}
            </div>
         </div>

         <div className="space-y-2">
            <label className="text-muted-foreground text-sm font-bold uppercase">Rows</label>
            <div className="grid grid-cols-3 gap-2">
               {[8, 12, 16].map(r => (
                 <button
                   key={r}
                   onClick={() => setRowCount(r)}
                   className={cn(
                     "py-2 rounded-lg text-sm font-bold transition-all",
                     rowCount === r 
                       ? "bg-primary text-black shadow-[0_0_15px_rgba(255,215,0,0.3)]" 
                       : "bg-secondary text-muted-foreground hover:bg-white/5"
                   )}
                 >
                   {r}
                 </button>
               ))}
            </div>
         </div>

         <button
           onClick={dropBall}
           className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl text-lg uppercase tracking-wider shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all transform active:scale-95"
         >
           Drop Ball
         </button>
      </div>

      {/* Game Canvas */}
      <div className="flex-1 bg-black/40 backdrop-blur-md rounded-3xl border border-white/5 p-4 flex justify-center items-center shadow-2xl overflow-hidden relative min-h-[600px]">
          <canvas 
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full h-full object-contain"
          />
      </div>

    </div>
  );
};

export default Plinko;
