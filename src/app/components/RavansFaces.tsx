import { motion } from 'motion/react';

interface RavansFacesProps {
  className?: string;
}

/**
 * Decorative overlay for the hero/preview screen.
 * Shows animated multiple face silhouettes arranged in a straight line.
 */
export function RavansFaces({ className }: RavansFacesProps) {
  // 4 on left, 5 on right
  const leftFaces = Array.from({ length: 4 }, (_, i) => -4 + i);
  const rightFaces = Array.from({ length: 5 }, (_, i) => 1 + i);
  const faces = [...leftFaces, ...rightFaces]; // -4, -3, -2, -1, 1, 2, 3, 4, 5

  return (
    <div className={className} style={{ pointerEvents: 'none' }}>
      <svg viewBox="0 0 100 100" className="w-full h-full opacity-25">
        {faces.map((pos, i) => {
          const x = 50 + pos * 10; // spacing
          const y = 50;
          return (
            <motion.g
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeInOut',
              }}
              transform={`translate(${x}, ${y})`}
            >
              <ellipse cx="0" cy="0" rx="4" ry="5.5" fill="#ffffff" opacity="0.6" />
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Draw the user's face multiple times in a straight line.
 * 4 on the left, 5 on the right.
 * Used by BirthdayCameraFilter for the live AR overlay.
 *
 * @param ctx - Canvas 2D rendering context
 * @param video - HTMLVideoElement to extract face from, or null for demo
 * @param centerX - X center of the user's face
 * @param centerY - Y center of the user's face
 * @param faceSize - Approximate face width
 * @param frame - Animation frame counter
 */
export function drawRavansFacesOverlay(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement | null,
  centerX: number,
  centerY: number,
  faceSize: number,
  frame: number
) {
  const numLeft = 4;
  const numRight = 5;
  // Make the face bounding box more compact to frame from top of head to chin
  const faceWidth = faceSize * 1.2;
  const faceHeight = faceSize * 1.2; // Reduced to be more compact vertically

  ctx.save();
  
  for (let i = -numLeft; i <= numRight; i++) {
    if (i === 0) continue; // Skip the main face in the center

    // Compact the horizontal space between heads by using a smaller multiplier (0.85 instead of 0.95)
    const dx = centerX + i * faceWidth * 0.85 - faceWidth / 2;
    const dy = centerY - faceHeight / 2;

    if (video) {
      // Extract face from video
      const sx = Math.max(0, centerX - faceWidth / 2);
      // Shift slightly down to capture more of the face and less of the top head
      const sy = Math.max(0, centerY - faceHeight / 2 + faceSize * 0.1);
      
      const sWidth = Math.min(faceWidth, video.videoWidth - sx);
      const sHeight = Math.min(faceHeight, video.videoHeight - sy);
      
      if (sWidth > 0 && sHeight > 0) {
        ctx.save();
        // Create a rounded container (ellipse) to clip the square video feed
        ctx.beginPath();
        ctx.ellipse(dx + sWidth / 2, dy + sHeight / 2, sWidth / 2, sHeight / 2, 0, 0, Math.PI * 2);
        ctx.clip();

        ctx.globalAlpha = 0.8; // Make copies slightly transparent
        ctx.drawImage(video, sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight);
        
        ctx.restore();
      }
    } else {
      // Fallback silhouette for demo mode
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.ellipse(dx + faceWidth / 2, dy + faceHeight / 2, faceWidth / 2, faceHeight / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}
