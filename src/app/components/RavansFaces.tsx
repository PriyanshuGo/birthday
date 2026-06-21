import { motion } from 'motion/react';

interface RavansFacesProps {
  className?: string;
}

/**
 * Decorative Ravan's faces overlay for the hero/preview screen.
 * Shows animated multiple face silhouettes arranged in a fan pattern.
 */
export function RavansFaces({ className }: RavansFacesProps) {
  // 10 heads of Ravan arranged in a semicircle
  const heads = Array.from({ length: 10 }, (_, i) => {
    const angle = -90 + (i - 4.5) * 18; // spread across ~180 degrees
    const rad = (angle * Math.PI) / 180;
    const radius = 120;
    const x = 50 + Math.cos(rad) * 15; // percentage
    const y = 45 + Math.sin(rad) * 15;
    return { x, y, angle, delay: i * 0.1 };
  });

  return (
    <div className={className} style={{ pointerEvents: 'none' }}>
      <svg viewBox="0 0 100 100" className="w-full h-full opacity-25">
        {heads.map((head, i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.1, 0.9] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: head.delay,
              ease: 'easeInOut',
            }}
            transform={`translate(${head.x}, ${head.y})`}
          >
            {/* Face oval */}
            <ellipse cx="0" cy="0" rx="4" ry="5.5" fill="#8B0000" opacity="0.6" />
            {/* Crown */}
            <polygon
              points="-4,-5 -3,-8 -1,-5.5 0,-9 1,-5.5 3,-8 4,-5"
              fill="#FFD700"
              opacity="0.7"
            />
            {/* Eyes */}
            <ellipse cx="-1.5" cy="-1" rx="0.8" ry="0.5" fill="#FF4500" />
            <ellipse cx="1.5" cy="-1" rx="0.8" ry="0.5" fill="#FF4500" />
            {/* Mouth */}
            <path d="M -1.5 2 Q 0 3.5 1.5 2" stroke="#FF4500" strokeWidth="0.3" fill="none" />
          </motion.g>
        ))}
        {/* Center glow */}
        <motion.circle
          cx="50"
          cy="45"
          r="8"
          fill="url(#ravanGlow)"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <defs>
          <radialGradient id="ravanGlow">
            <stop offset="0%" stopColor="#FF4500" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

/**
 * Draw Ravan's multiple faces around the user's head on a canvas.
 * Used by BirthdayCameraFilter for the live AR overlay.
 *
 * @param ctx - Canvas 2D rendering context
 * @param centerX - X center of the user's face
 * @param centerY - Y center of the user's face
 * @param faceSize - Approximate face width (eye distance * scale)
 * @param frame - Animation frame counter for flickering effects
 */
export function drawRavansFacesOverlay(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  faceSize: number,
  frame: number
) {
  const numHeads = 10;
  const headRadius = faceSize * 0.3;
  const orbitRadius = faceSize * 1.1;

  ctx.save();

  for (let i = 0; i < numHeads; i++) {
    const angle = -Math.PI + ((i + 0.5) / numHeads) * Math.PI;
    const hx = centerX + Math.cos(angle) * orbitRadius;
    const hy = centerY + Math.sin(angle) * orbitRadius * 0.7 - faceSize * 0.3;

    // Slight bobbing animation per head
    const bob = Math.sin(frame * 0.05 + i * 0.7) * 3;

    // Face oval - dark red/maroon
    ctx.fillStyle = 'rgba(139, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.ellipse(hx, hy + bob, headRadius * 0.7, headRadius, 0, 0, Math.PI * 2);
    ctx.fill();

    // Crown / headdress
    ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
    ctx.beginPath();
    const crownBase = hy + bob - headRadius;
    const crownWidth = headRadius * 0.7;
    // 5-pointed crown
    for (let p = 0; p < 5; p++) {
      const px = hx - crownWidth + (crownWidth * 2 / 4) * p;
      const peakY = crownBase - headRadius * 0.5;
      const valleyY = crownBase;
      if (p === 0) {
        ctx.moveTo(hx - crownWidth, valleyY);
      }
      ctx.lineTo(px, peakY);
      ctx.lineTo(px + crownWidth * 2 / 4 / 2, valleyY);
    }
    ctx.closePath();
    ctx.fill();

    // Eyes - glowing orange-red
    const eyeFlicker = Math.sin(frame * 0.1 + i * 2) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255, 69, 0, ${eyeFlicker})`;
    const eyeY = hy + bob - headRadius * 0.15;
    const eyeSpacing = headRadius * 0.3;
    ctx.beginPath();
    ctx.ellipse(hx - eyeSpacing, eyeY, headRadius * 0.12, headRadius * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(hx + eyeSpacing, eyeY, headRadius * 0.12, headRadius * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye glow
    const glowGrad = ctx.createRadialGradient(hx, eyeY, 0, hx, eyeY, headRadius * 0.4);
    glowGrad.addColorStop(0, `rgba(255, 69, 0, ${eyeFlicker * 0.3})`);
    glowGrad.addColorStop(1, 'rgba(255, 69, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(hx, eyeY, headRadius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Menacing mouth
    ctx.strokeStyle = `rgba(255, 69, 0, ${eyeFlicker * 0.8})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const mouthY = hy + bob + headRadius * 0.4;
    ctx.moveTo(hx - headRadius * 0.25, mouthY);
    ctx.quadraticCurveTo(hx, mouthY + headRadius * 0.2, hx + headRadius * 0.25, mouthY);
    ctx.stroke();
  }

  // Central fire aura around main face
  const auraGrad = ctx.createRadialGradient(
    centerX, centerY - faceSize * 0.2, faceSize * 0.3,
    centerX, centerY - faceSize * 0.2, faceSize * 1.3
  );
  const pulse = Math.sin(frame * 0.03) * 0.1 + 0.15;
  auraGrad.addColorStop(0, `rgba(255, 69, 0, ${pulse})`);
  auraGrad.addColorStop(0.5, `rgba(139, 0, 0, ${pulse * 0.5})`);
  auraGrad.addColorStop(1, 'rgba(139, 0, 0, 0)');
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(centerX, centerY - faceSize * 0.2, faceSize * 1.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
