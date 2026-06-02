import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';

interface Balloon {
  id: number;
  x: number;
  color: string;
  delay: number;
}

export function BalloonGame() {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
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

  const popBalloon = (id: number) => {
    setBalloons(prev => prev.filter(b => b.id !== id));
    setScore(prev => prev + 1);
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden h-64">
      <div className="absolute top-4 right-4 bg-white/80 px-4 py-2 rounded-full shadow-lg z-10">
        <span className="text-sm">🎈 Popped: {score}</span>
      </div>
      
      <h3 className="text-lg mb-4">Pop the Balloons!</h3>
      
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence>
          {balloons.map((balloon) => (
            <motion.div
              key={balloon.id}
              initial={{ y: '100%', scale: 0 }}
              animate={{ y: '-120%', scale: 1 }}
              exit={{ scale: 0 }}
              transition={{
                duration: 8,
                delay: balloon.delay,
                ease: 'linear',
              }}
              style={{ left: `${balloon.x}%` }}
              className="absolute cursor-pointer"
              onClick={() => popBalloon(balloon.id)}
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
      </div>
    </Card>
  );
}
