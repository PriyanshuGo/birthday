import { motion } from 'motion/react';
import { Cake, Sparkles, Gift, PartyPopper } from 'lucide-react';
import { Button } from './ui/button';

interface BirthdayHeroProps {
  onStartExperience: () => void;
}

export function BirthdayHero({ onStartExperience }: BirthdayHeroProps) {
  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const pulseVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: -100,
              rotate: Math.random() * 360,
            }}
            animate={{
              y: window.innerHeight + 100,
              rotate: Math.random() * 360 + 360,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          >
            <div className="text-4xl opacity-30">
              {['🎈', '🎉', '🎁', '🎂', '✨'][Math.floor(Math.random() * 5)]}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            variants={floatingVariants}
            initial="initial"
            animate="animate"
            className="mb-8"
          >
            <Cake className="w-32 h-32 mx-auto text-pink-500" />
          </motion.div>

          <h1 className="text-6xl md:text-8xl mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Happy Birthday!
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 mb-8">
            Make a wish and blow out the candles 🎂✨
          </p>

          <div className="flex gap-4 justify-center mb-12">
            <motion.div
              variants={floatingVariants}
              initial="initial"
              animate="animate"
              style={{ animationDelay: '0.5s' }}
            >
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </motion.div>
            <motion.div
              variants={floatingVariants}
              initial="initial"
              animate="animate"
              style={{ animationDelay: '1s' }}
            >
              <Gift className="w-8 h-8 text-purple-500" />
            </motion.div>
            <motion.div
              variants={floatingVariants}
              initial="initial"
              animate="animate"
              style={{ animationDelay: '1.5s' }}
            >
              <PartyPopper className="w-8 h-8 text-pink-500" />
            </motion.div>
          </div>

          <motion.div variants={pulseVariants} initial="initial" animate="animate">
            <Button
              onClick={onStartExperience}
              size="lg"
              className="text-xl px-12 py-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-2xl"
            >
              <Cake className="w-6 h-6 mr-3" />
              Start AR Experience
            </Button>
          </motion.div>

          <p className="mt-8 text-sm text-gray-600">
            Use your camera and microphone to blow out the candles!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
