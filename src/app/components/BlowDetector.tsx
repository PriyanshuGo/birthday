import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, AlertCircle, Wind } from 'lucide-react';
import { Button } from './ui/button';

interface BlowDetectorProps {
  onBlowDetected: () => void;
  isActive: boolean;
}

type MicState = 'idle' | 'requesting' | 'active' | 'denied';

export function BlowDetector({ onBlowDetected, isActive }: BlowDetectorProps) {
  const [micState, setMicState] = useState<MicState>('idle');
  const [blowStrength, setBlowStrength] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (micState !== 'active' || !isActive) {
      stopListening();
    }
  }, [isActive]);

  useEffect(() => {
    return () => stopListening();
  }, []);

  const enableMic = async () => {
    setMicState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();

      const microphone = audioContextRef.current.createMediaStreamSource(stream);
      microphone.connect(analyserRef.current);

      analyserRef.current.fftSize = 512;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      setMicState('active');
      const detectBlow = () => {
        if (!analyserRef.current || !isActive) {
          animationFrameRef.current = requestAnimationFrame(detectBlow);
          return;
        }

        analyserRef.current.getByteFrequencyData(dataArray);

        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        const lowFreqAverage = dataArray.slice(0, 20).reduce((sum, value) => sum + value, 0) / 20;

        setBlowStrength(Math.min(100, lowFreqAverage));

        if (lowFreqAverage > 80 && average > 40) {
          onBlowDetected();
        }

        animationFrameRef.current = requestAnimationFrame(detectBlow);
      };

      detectBlow();
    } catch {
      setMicState('denied');
    }
  };

  const stopListening = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setBlowStrength(0);
  };

  const disableMic = () => {
    stopListening();
    setMicState('idle');
  };

  // Simulate blow for demo/testing
  const simulateBlow = () => {
    if (isActive) {
      setBlowStrength(100);
      onBlowDetected();
      setTimeout(() => setBlowStrength(0), 500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {micState === 'idle' && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Enable your microphone to blow out the candles
          </p>
          <Button
            onClick={enableMic}
            size="lg"
            className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white"
          >
            <Mic className="w-5 h-5 mr-2" />
            Enable Microphone
          </Button>
        </div>
      )}

      {micState === 'requesting' && (
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Allow microphone access in your browser...</p>
        </div>
      )}

      {micState === 'active' && (
        <>
          <Button
            onClick={disableMic}
            variant="default"
            size="lg"
            className="rounded-full w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600"
          >
            <Mic className="w-6 h-6" />
          </Button>

          <div className="w-full max-w-xs">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100 rounded-full"
                style={{ width: `${blowStrength}%` }}
              />
            </div>
            <p className="text-xs text-center mt-2 text-muted-foreground">
              {blowStrength > 60 ? '💨 Great blow!' : blowStrength > 20 ? '💨 Blow harder!' : 'Blow into the mic to extinguish candles'}
            </p>
          </div>
        </>
      )}

      {micState === 'denied' && (
        <div className="w-full">
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm mb-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-red-700">Microphone access denied</p>
              <p className="text-red-600 mt-0.5">
                Click the microphone icon in your browser's address bar to allow access, then retry.
              </p>
            </div>
          </div>
          <Button onClick={enableMic} variant="outline" className="w-full" size="sm">
            <Mic className="w-4 h-4 mr-2" />
            Retry Microphone
          </Button>
        </div>
      )}

      {/* Simulate blow button shown when mic is unavailable */}
      {(micState === 'idle' || micState === 'denied') && isActive && (
        <div className="text-center mt-2">
          <p className="text-xs text-muted-foreground mb-2">No microphone? Use the button below:</p>
          <Button
            onClick={simulateBlow}
            variant="outline"
            size="sm"
            className="border-dashed border-purple-400 text-purple-600 hover:bg-purple-50"
          >
            <Wind className="w-4 h-4 mr-2" />
            Simulate Blow 💨
          </Button>
        </div>
      )}
    </div>
  );
}
