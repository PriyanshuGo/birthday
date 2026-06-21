import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BirthdayHero } from "./components/BirthdayHero";
import {
  BirthdayCameraFilter,
  BirthdayCameraFilterRef,
} from "./components/BirthdayCameraFilter";

import { ParticleEffect } from "./components/ParticleEffect";
import { ConfettiCelebration } from "./components/ConfettiCelebration";
import { WishMessage } from "./components/WishMessage";
import { BalloonGame } from "./components/BalloonGame";
import { PhotoBooth } from "./components/PhotoBooth";
import { Button } from "./components/ui/button";
import { Home, RotateCcw, Camera } from "lucide-react";
import { Card } from "./components/ui/card";

export default function App() {
  const [showHero, setShowHero] = useState(true);
  const [candlesLit, setCandlesLit] = useState(true);
  const [celebrationTriggered, setCelebrationTriggered] =
    useState(false);
  const [blowCount, setBlowCount] = useState(0);
  const [wishes, setWishes] = useState<string[]>([]);
  const cameraRef = useRef<BirthdayCameraFilterRef>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [showFlash, setShowFlash] = useState(false);

  const takePhoto = () => {
    const canvasRef = cameraRef.current?.getCanvasRef();
    if (canvasRef?.current) {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 200);
      const imageData = canvasRef.current.toDataURL("image/png");
      setPhotos((prev) => [imageData, ...prev.slice(0, 4)]);
    }
  };

  const handleStartExperience = () => {
    setShowHero(false);
  };

  const handleBlowDetected = () => {
    if (candlesLit) {
      setCandlesLit(false);
      setCelebrationTriggered(true);
      setBlowCount((prev) => prev + 1);

      // Reset celebration trigger after animation
      setTimeout(() => setCelebrationTriggered(false), 3500);
    }
  };

  const handleReset = () => {
    setCandlesLit(true);
    setCelebrationTriggered(false);
  };

  const handleBackToHome = () => {
    setShowHero(true);
    setCandlesLit(true);
    setCelebrationTriggered(false);
  };

  const handleWishSubmit = (wish: string) => {
    setWishes((prev) => [...prev, wish]);
  };

  return (
    <div className="min-h-screen relative">
      <ParticleEffect />
      <ConfettiCelebration trigger={celebrationTriggered} />

      {/* Flash effect */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showHero ? (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            <BirthdayHero
              onStartExperience={handleStartExperience}
            />
          </motion.div>
        ) : (
          <motion.div
            key="experience"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4"
          >
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <h1 className="text-4xl md:text-6xl mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  🎂 Birthday AR Filter 🎂
                </h1>
                <p className="text-lg text-gray-700">
                  Blow into your microphone to blow out the
                  candles!
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Camera Section */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-xl">
                    <BirthdayCameraFilter
                      onBlowDetected={handleBlowDetected}
                      candlesLit={candlesLit}
                      ref={cameraRef}
                    />
                    <div className="flex gap-4 mt-6">
                      <Button
                        onClick={handleReset}
                        variant="default"
                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600"
                        disabled={candlesLit}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Relight Candles
                      </Button>
                      <Button
                        onClick={takePhoto}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo
                      </Button>
                    </div>
                  </Card>
                </motion.div>

                {/* Controls Section */}
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-6"
                >
                </motion.div>
              </div>

              {/* Success Message */}
              <AnimatePresence>
                {!candlesLit && (
                  <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.9 }}
                    className="mt-8"
                  >
                    <Card className="p-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-center shadow-2xl">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                      >
                        <h2 className="text-3xl md:text-5xl mb-4">
                          🎉 Happy Birthday! 🎉
                        </h2>
                        <p className="text-xl">
                          May all your wishes come true! ✨
                        </p>
                      </motion.div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Additional Interactive Section */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 space-y-8"
              >
                <div className="grid md:grid-cols-2 gap-8">
                  <WishMessage
                    onWishSubmit={handleWishSubmit}
                  />
                  <BalloonGame />
                </div>
                <PhotoBooth photos={photos} setPhotos={setPhotos} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}