import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BirthdayHero } from "./components/BirthdayHero";
import { lazy, Suspense } from "react";

import {
  BirthdayCameraFilter,
  BirthdayCameraFilterRef,
} from "./components/BirthdayCameraFilter";

const PhotoBooth = lazy(() =>
  import("./components/PhotoBooth")
);

const WishMessage = lazy(() =>
  import("./components/WishMessage")
);
import { ParticleEffect } from "./components/ParticleEffect";
import { ConfettiCelebration } from "./components/ConfettiCelebration";
import { Button } from "./components/ui/button";
import { RotateCcw, Camera, CameraOff, X } from "lucide-react";
import { Card } from "./components/ui/card";
import { canvasRecorder, ENABLE_RECORDING } from "./lib/CanvasRecorder";

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
  const [selectedFilter, setSelectedFilter] = useState<'cake' | 'ravans'>('cake');

  const takePhoto = useCallback(() => {
    const canvasRef = cameraRef.current?.getCanvasRef();
    if (canvasRef?.current) {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 200);
      const imageData = canvasRef.current.toDataURL("image/png");
      setPhotos((prev) => [imageData, ...prev.slice(0, 4)]);
    }
  }, []);

  const birthdayMusicRef = useRef(
    new Audio("/music/happy-birthday.mp3")
  );


  useEffect(() => {
    const audio = birthdayMusicRef.current;

    audio.preload = "metadata";
    audio.volume = 0.7;

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);


  const [mediaError, setMediaError] = useState<string | null>(null);

  const requestMediaAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Only checking permission
      stream.getTracks().forEach((track) => track.stop());

      setMediaError(null);
      return true;
    } catch (err: unknown) {
      console.error("Media access denied:", err);

      if (
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "SecurityError")
      ) {
        setMediaError(
          "Camera and microphone access were denied. Please enable permissions in your browser settings and try again."
        );
      } else {
        setMediaError(
          "Camera and microphone access are required to start the experience."
        );
      }

      return false;
    }
  };

  const handleStartExperience = async () => {
    const granted = await requestMediaAccess();
    if (granted) {
      setShowHero(false);

    }
  };

  const handleBlowDetected = useCallback(() => {
    if (candlesLit) {
      setCandlesLit(false);
      setCelebrationTriggered(true);
      setBlowCount((prev) => prev + 1);

      const audio = birthdayMusicRef.current;
      audio.currentTime = 0;
      audio.play().catch(console.error);

      setTimeout(() => setCelebrationTriggered(false), 3500);
    }
  }, [])

  const handleReset = useCallback(() => {
    birthdayMusicRef.current.pause();
    birthdayMusicRef.current.currentTime = 0;

    setCandlesLit(true);
    setCelebrationTriggered(false);
  }, [])

  const handleWishSubmit = useCallback(async (wish: string) => {
    try {
      const response = await fetch("https://formspree.io/f/xdaqjoad", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          message: wish,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit wish");
      }

      console.log("Wish sent!");
    } catch (error) {
      console.error(error);
    }
  }, [])

  return (
    <div className="min-h-screen relative">
      {showHero && <ParticleEffect />}
      {celebrationTriggered && (
        <ConfettiCelebration trigger />
      )}
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
                  Open your mouth toward the camera to blow out the candles!
                </p>
              </motion.div>

              <div className="flex justify-center">                {/* Camera Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="w-full max-w-2xl"
                >
                  <Card className="p-4 bg-white/80 backdrop-blur-sm shadow-xl">
                    <Suspense fallback={null}>

                      <BirthdayCameraFilter
                        onBlowDetected={handleBlowDetected}
                        candlesLit={candlesLit}
                        filterType={selectedFilter}
                        ref={cameraRef}
                      />
                    </Suspense>
                    <div className="flex gap-2 ">
                      {selectedFilter === "cake" && (
                        <Button
                          onClick={handleReset}
                          variant="default"
                          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600"
                          disabled={candlesLit}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Relight Candles
                        </Button>
                      )}

                      <Button
                        onClick={takePhoto}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Take Photo
                      </Button>
                    </div>
                    {/* Filter switcher */}
                    <div className="flex gap-2 justify-center">
                      <Button
                        onClick={() => setSelectedFilter('cake')}
                        variant={selectedFilter === 'cake' ? 'default' : 'outline'}
                        size="sm"
                        className={selectedFilter === 'cake' ? 'bg-gradient-to-r from-pink-500 to-purple-600' : ''}
                      >
                        🎂 Cake
                      </Button>
                      <Button
                        onClick={() => setSelectedFilter('ravans')}
                        variant={selectedFilter === 'ravans' ? 'default' : 'outline'}
                        size="sm"
                        className={selectedFilter === 'ravans' ? 'bg-gradient-to-r from-red-600 to-orange-500' : ''}
                      >
                        👹 Ravans
                      </Button>
                    </div>
                  </Card>
                </motion.div>

              </div>
              {/* Additional Interactive Section */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 space-y-8"
              >
                <div className="">
                  <Suspense fallback={null}>
                    <WishMessage
                      onWishSubmit={handleWishSubmit}
                    />
                  </Suspense>
                </div>
                <Suspense fallback={null}>
                  <PhotoBooth photos={photos} setPhotos={setPhotos} />
                </Suspense>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Error Modal */}
      <AnimatePresence>
        {mediaError && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMediaError(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-red-100 dark:border-red-900/30 overflow-hidden p-6 z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setMediaError(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                {/* Decorative background pulse */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-900/20 animate-ping opacity-75" />
                  <div className="relative p-4 bg-red-50 dark:bg-red-900/30 rounded-full text-red-500">
                    <CameraOff className="w-8 h-8" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Camera & Mic Required
                </h3>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                  {mediaError}
                </p>

                {/* Manual step-by-step instruction */}
                <div className="bg-red-50/70 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl p-4 mb-6 text-left w-full space-y-2.5">
                  <p className="text-xs font-semibold text-red-800 dark:text-red-300 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    MANUAL ACTION REQUIRED
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-normal">
                    Since permissions are blocked, the browser will not show a prompt automatically. You must allow it manually:
                  </p>
                  <ol className="text-xs text-gray-700 dark:text-gray-300 list-decimal list-inside space-y-1.5 leading-relaxed bg-white/40 dark:bg-black/20 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
                    <li>Look at the browser <strong>address bar</strong> at the top.</li>
                    <li>Click the <strong>Lock (🔒)</strong> or <strong>Camera (📹)</strong> icon left of the website name.</li>
                    <li>Change both <strong>Camera</strong> and <strong>Microphone</strong> to <strong>Allow</strong>.</li>
                    <li>Once allowed, close this popup and click <strong>Start Experience</strong> again, or refresh the page.</li>
                  </ol>
                </div>

                <div className="w-full">
                  <Button
                    onClick={() => setMediaError(null)}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium shadow-md shadow-red-500/10 hover:shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Got It
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}