import { useCallback } from 'react';
import { useGameStore } from '../store/gameStore';

const useSound = () => {
  const { volume } = useGameStore();

  const playTone = useCallback((freq, type, duration) => {
    if (volume === 0) return;
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(volume * 0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, [volume]);

  const playClick = () => playTone(800, 'sine', 0.1);
  const playHover = () => playTone(400, 'sine', 0.05);
  
  const playWin = () => {
    if (volume === 0) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Arpeggio
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(volume * 0.1, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.3);
    });
  };

  const playLoss = () => {
     if (volume === 0) return;
     playTone(150, 'sawtooth', 0.4);
  };

  const playCoin = () => {
     if (volume === 0) return;
     playTone(1200 + Math.random() * 200, 'sine', 0.1);
  };

  return { playClick, playHover, playWin, playLoss, playCoin };
};

export default useSound;
