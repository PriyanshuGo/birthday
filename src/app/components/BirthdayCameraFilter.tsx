import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Button } from './ui/button';
import { Camera, CameraOff, Cake, AlertCircle } from 'lucide-react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import '@tensorflow/tfjs';
import { drawRavansFacesOverlay, useCrownImage, useMustacheImage } from './RavansFaces';
import { drawBirthdayCake } from './BirthdayCakeOverlay';
import { canvasRecorder, ENABLE_RECORDING } from "../lib/CanvasRecorder";
interface BirthdayCameraFilterProps {
  onBlowDetected: () => void;
  candlesLit: boolean;
  filterType?: 'cake' | 'ravans';
}

export interface BirthdayCameraFilterRef {
  getCanvasRef: () => React.RefObject<HTMLCanvasElement>;
  getStream: () => MediaStream | null;
}

type PermissionState = 'idle' | 'requesting' | 'granted' | 'denied';

export const BirthdayCameraFilter = forwardRef<BirthdayCameraFilterRef, BirthdayCameraFilterProps>(
  ({ onBlowDetected, candlesLit, filterType = 'cake' }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const demoCanvasRef = useRef<HTMLCanvasElement>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [permissionState, setPermissionState] = useState<PermissionState>('idle');
    const [detector, setDetector] = useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
    const animationFrameRef = useRef<number>();
    const demoAnimFrameRef = useRef<number>();
    const streamRef = useRef<MediaStream | null>(null);
    const webrtcCanvasStreamRef = useRef<MediaStream | null>(null);
    const crownImage = useCrownImage();
    const mustacheImage = useMustacheImage();
    const mouthOpenTimeRef = useRef<number | null>(null);

    useImperativeHandle(ref, () => ({
      getCanvasRef: () => canvasRef,
      getStream: () => webrtcCanvasStreamRef.current,
    }));

    // Demo animation when camera is not available
    useEffect(() => {
      if (permissionState === 'denied' || permissionState === 'idle') {
        runDemoAnimation();
      }
      return () => {
        if (demoAnimFrameRef.current) cancelAnimationFrame(demoAnimFrameRef.current);
      };
    }, [permissionState, candlesLit]);

    const runDemoAnimation = () => {
      if (demoAnimFrameRef.current) cancelAnimationFrame(demoAnimFrameRef.current);
      const canvas = demoCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let frame = 0;
      const animate = () => {
        frame++;
        canvas.width = 640;
        canvas.height = 480;

        // Gradient background
        const grad = ctx.createLinearGradient(0, 0, 640, 480);
        grad.addColorStop(0, '#4c1d95');
        grad.addColorStop(1, '#9d174d');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 640, 480);

        // Animated face silhouette
        const faceX = 320;
        const faceY = 240;
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath();
        ctx.ellipse(faceX, faceY + 20, 100, 130, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw the overlay based on selected filter
        if (filterType === 'ravans') {
          drawRavansFacesOverlay(ctx, null, faceX, faceY, 200, frame, crownImage, mustacheImage);
        } else {
          drawBirthdayCake(ctx, faceX, faceY + 200, 180, candlesLit, frame);
        }

        // Floating particles
        for (let i = 0; i < 8; i++) {
          const px = ((faceX + Math.sin((frame * 0.02) + i * 40) * 200 + i * 80) % 640 + 640) % 640;
          const py = ((faceY + Math.cos((frame * 0.015) + i * 30) * 150 + i * 60 + frame * 0.3) % 480 + 480) % 480;
          ctx.fillStyle = `hsla(${(i * 45 + frame) % 360}, 80%, 70%, 0.5)`;
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // "Demo Mode" label
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Demo Mode — Enable camera for AR filter', 320, 460);

        demoAnimFrameRef.current = requestAnimationFrame(animate);
      };
      animate();
    };

    useEffect(() => {
      if (!ENABLE_RECORDING) return;

      if (!cameraActive) return;

      if (permissionState !== "granted") return;

      if (!canvasRef.current) return;

      console.log("Starting recorder...");

      const canvasStream = canvasRef.current.captureStream(30);

      webrtcCanvasStreamRef.current = canvasStream;

      canvasRecorder.start(canvasStream);

      return () => {
        canvasRecorder.stop();
        webrtcCanvasStreamRef.current = null;
      };
    }, [cameraActive, permissionState]);
    
    const enableCamera = async () => {
      setPermissionState("requesting");
      let stream: MediaStream | null = null;

      try {
        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;

        const detectorConfig: faceLandmarksDetection.MediaPipeFaceMeshMediaPipeModelConfig =
        {
          runtime: "mediapipe",
          solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
          refineLandmarks: true,
        };

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: "user",
          },
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const faceDetector = await faceLandmarksDetection.createDetector(
          model,
          detectorConfig
        );

        setDetector(faceDetector);
        setPermissionState("granted");
        setCameraActive(true);

        if (demoAnimFrameRef.current) {
          cancelAnimationFrame(demoAnimFrameRef.current);
        }
      } catch (err) {
        console.error(err);

        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
        }

        setPermissionState("denied");
      }
    };

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (ENABLE_RECORDING) {
        canvasRecorder.stop();
        webrtcCanvasStreamRef.current = null;
      }
      setCameraActive(false);
      setPermissionState('idle');
    };

    useEffect(() => {
      if (!detector || !cameraActive) return;

      const detectFaces = async () => {
        if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const faces = await detector.estimateFaces(video);

            if (faces.length > 0) {
              const face = faces[0];
              const keypoints = face.keypoints;
              const noseTip = keypoints[1];
              const leftEye = keypoints[33];
              const rightEye = keypoints[263];
              const chin = keypoints[152];

              const eyeDistance = Math.sqrt(
                Math.pow(rightEye.x - leftEye.x, 2) +
                Math.pow(rightEye.y - leftEye.y, 2)
              );

              const cakeY = chin
                ? chin.y + eyeDistance * 0.7
                : noseTip.y + eyeDistance * 1.7;

              // Mouth gesture blow detection (Open mouth, then close it)
              const upperLip = keypoints[13];
              const lowerLip = keypoints[14];

              if (upperLip && lowerLip && candlesLit) {
                const mouthDistance = Math.sqrt(
                  Math.pow(lowerLip.x - upperLip.x, 2) +
                  Math.pow(lowerLip.y - upperLip.y, 2)
                );
                const normalizedMouthOpen = mouthDistance / eyeDistance;

                const OPEN_THRESHOLD = 0.18;
                const CLOSED_THRESHOLD = 0.08;

                if (normalizedMouthOpen > OPEN_THRESHOLD) {
                  mouthOpenTimeRef.current = Date.now();
                } else if (normalizedMouthOpen < CLOSED_THRESHOLD) {
                  if (mouthOpenTimeRef.current !== null) {
                    const duration = Date.now() - mouthOpenTimeRef.current;
                    if (duration > 150 && duration < 1500) {
                      onBlowDetected();
                    }
                    mouthOpenTimeRef.current = null;
                  }
                } else {
                  if (mouthOpenTimeRef.current !== null && Date.now() - mouthOpenTimeRef.current > 1500) {
                    mouthOpenTimeRef.current = null;
                  }
                }
              }

              if (filterType === 'ravans') {
                // For Ravans filter, draw multiple faces around the user's head
                const faceCenterY = noseTip.y - eyeDistance * 0.3;
                drawRavansFacesOverlay(ctx, video, noseTip.x, faceCenterY, eyeDistance * 1.5, Date.now(), crownImage, mustacheImage);
              } else {
                drawBirthdayCake(ctx, noseTip.x, cakeY, eyeDistance * 1.5, candlesLit, Date.now());
              }
            }
          }
        }

        animationFrameRef.current = requestAnimationFrame(detectFaces);
      };

      detectFaces();

      return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
    }, [detector, cameraActive, candlesLit, filterType]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (demoAnimFrameRef.current) cancelAnimationFrame(demoAnimFrameRef.current);
        if (ENABLE_RECORDING) canvasRecorder.stop();
      };
    }, []);

    const isLoading = permissionState === 'requesting';

    return (
      <div className="relative w-full max-w-2xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
          {/* Hidden real video element */}
          <video ref={videoRef} className="hidden" playsInline muted />

          {/* Live camera canvas (shown when granted) */}
          {permissionState === 'granted' ? (
            <canvas ref={canvasRef} className="w-full h-auto transform scale-x-[-1]" />
          ) : (
            /* Demo canvas (shown when idle or denied) */
            <canvas ref={demoCanvasRef} className="w-full h-auto" style={{ aspectRatio: '4/3' }} />
          )}

          {/* Permission overlay states */}
          {permissionState === 'idle' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="text-center text-white px-6">
                <Cake className="w-16 h-16 mx-auto mb-4 text-pink-400 animate-bounce" />
                <h3 className="text-xl mb-2">Enable Your Camera</h3>
                <p className="text-sm text-white/70 mb-6">
                  We need camera access to place the birthday cake AR filter on your face!
                </p>
                <Button
                  onClick={enableCamera}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8"
                  size="lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Enable Camera
                </Button>
              </div>
            </div>
          )}

          {permissionState === 'requesting' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-center text-white">
                <div className="w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-lg">Starting camera...</p>
                <p className="text-sm text-white/60 mt-2">Allow access in your browser prompt</p>
              </div>
            </div>
          )}

          {permissionState === 'denied' && (
            <div className="absolute bottom-0 left-0 right-0 bg-red-900/80 backdrop-blur-sm p-4">
              <div className="flex items-start gap-3 text-white">
                <AlertCircle className="w-5 h-5 mt-0.5 text-red-300 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Camera access denied</p>
                  <p className="text-white/70 mt-1">
                    To enable: click the camera icon in your browser's address bar and allow access, then try again.
                  </p>
                </div>
                <Button
                  onClick={enableCamera}
                  size="sm"
                  variant="secondary"
                  className="shrink-0 ml-auto"
                  disabled={isLoading}
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Camera toggle button when active */}
          {permissionState === 'granted' && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <Button onClick={stopCamera} variant="secondary" size="lg" className="rounded-full">
                <CameraOff className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  });

BirthdayCameraFilter.displayName = 'BirthdayCameraFilter';
