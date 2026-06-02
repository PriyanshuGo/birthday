import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';

interface Balloon {
  id: number;
  x: number;
  color: string;
  delay: number;
}

interface PopEffect {
  id: number;
  x: number;
  y: number;
  color: string;
}

export function BalloonGame() {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [popEffects, setPopEffects] = useState<PopEffect[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const colors = ['#FF69B4', '#FFB6C1', '#FFC0CB', '#FF1493', '#C71585', '#FFD700'];
    const interval = setInterval(() => {
      const newBalloon: Balloon = {
        id: Date.now() + Math.random(),
        x: Math.random() * 80 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 2,
      };
      
      setBalloons(prev => [...prev.slice(-5), newBalloon]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const playPopSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.error('AudioContext error:', e);
    }
  };

  const popBalloon = (e: React.MouseEvent<HTMLDivElement>, id: number, color: string) => {
    e.stopPropagation();
    
    // Play satisfying popping sound
    playPopSound();

    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
    const balloonRect = e.currentTarget.getBoundingClientRect();
    
    if (rect && balloonRect) {
      const x = balloonRect.left - rect.left + balloonRect.width / 2;
      const y = balloonRect.top - rect.top + balloonRect.height / 2;
      
      const newEffect = {
        id: Date.now() + Math.random(),
        x,
        y,
        color,
      };
      setPopEffects(prev => [...prev, newEffect]);
      setTimeout(() => {
        setPopEffects(prev => prev.filter(eff => eff.id !== newEffect.id));
      }, 600);
    }

    setBalloons(prev => prev.filter(b => b.id !== id));
    setScore(prev => prev + 1);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden h-64 select-none">
      <div className="absolute top-4 right-4 bg-white/80 px-4 py-2 rounded-full shadow-lg z-10">
        <span className="text-sm font-semibold">🎈 Popped: {score}</span>
      </div>
      
      <h3 className="text-lg mb-4 font-semibold">Pop the Balloons!</h3>
      
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence>
          {balloons.map((balloon) => (
            <motion.div
              key={balloon.id}
              initial={{ y: '100%', scale: 0, opacity: 1 }}
              animate={{ y: '-120%', scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{
                y: { duration: 8, delay: balloon.delay, ease: 'linear' },
                scale: { duration: 0.2, ease: 'easeOut' },
                opacity: { duration: 0.2, ease: 'easeOut' },
                default: { duration: 8, delay: balloon.delay, ease: 'linear' }
              }}
              style={{ left: `${balloon.x}%` }}
              className="absolute cursor-pointer"
              onClick={(e) => popBalloon(e, balloon.id, balloon.color)}
            >
              <motion.div
                animate={{
                  x: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <svg width="60" height="80" viewBox="0 0 60 80">
                  {/* Balloon */}
                  <ellipse
                    cx="30"
                    cy="35"
                    rx="25"
                    ry="30"
                    fill={balloon.color}
                    opacity="0.9"
                  />
                  {/* Highlight */}
                  <ellipse
                    cx="22"
                    cy="25"
                    rx="8"
                    ry="12"
                    fill="white"
                    opacity="0.4"
                  />
                  {/* String */}
                  <path
                    d="M 30 65 Q 25 70, 30 75"
                    stroke={balloon.color}
                    strokeWidth="2"
                    fill="none"
                    opacity="0.7"
                  />
                </svg>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Pop particle effects */}
        {popEffects.map((effect) => (
          <div
            key={effect.id}
            className="absolute pointer-events-none"
            style={{ left: effect.x, top: effect.y }}
          >
            {[...Array(8)].map((_, i) => {
              const angle = (i * Math.PI) / 4;
              const distance = 40;
              return (
                <motion.div
                  key={i}
                  className="absolute w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: effect.color, left: -5, top: -5 }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    opacity: 0,
                    scale: 0.2,
                  }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
}
