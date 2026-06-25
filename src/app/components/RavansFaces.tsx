import { motion } from 'motion/react';

interface RavansFacesProps {
  className?: string;
}

/**
 * Reusable SVG crown, drawn in a local coordinate space centered at (0,0)
 * with its bottom edge sitting at y=0 (so you just translate it to sit
 * right above a face ellipse). `scale` lets the main face get a BIG crown
 * and clones get progressively smaller ones.
 */
function Crown({ scale = 1 }: { scale?: number }) {
  const w = 10 * scale;
  const h = 5.5 * scale;
  const bandH = h * 0.3;

  return (
    <g>
      {/* Crown body */}
      <path
        d={`M ${-w / 2} 0 L ${-w / 2} ${-bandH} L ${-w / 2 + w * 0.1} ${-h} L ${-w / 2 + w * 0.3} ${-bandH} L ${-w / 2 + w * 0.5} ${-h * 1.25} L ${-w / 2 + w * 0.7} ${-bandH} L ${-w / 2 + w * 0.9} ${-h} L ${w / 2} ${-bandH} L ${w / 2} 0 Z`}
        fill="#FFC94A"
        stroke="#B8860B"
        strokeWidth={Math.max(0.15, scale * 0.15)}
      />
      {/* Band highlight */}
      <rect x={-w / 2} y={-bandH} width={w} height={bandH} fill="rgba(255,255,255,0.18)" />
      {/* Gems on spike tips */}
      {[0.1, 0.5, 0.9].map((t, idx) => {
        const cx = -w / 2 + w * t;
        const cy = t === 0.5 ? -h * 1.25 : -h;
        return (
          <circle
            key={idx}
            cx={cx}
            cy={cy}
            r={Math.max(0.3, scale * 0.45)}
            fill={t === 0.5 ? '#3A86FF' : '#E63946'}
            stroke="rgba(0,0,0,0.25)"
            strokeWidth={Math.max(0.1, scale * 0.08)}
          />
        );
      })}
    </g>
  );
}

/**
 * Decorative overlay for the hero/preview screen.
 * Shows animated multiple face silhouettes arranged in a straight line,
 * each topped with a crown — the center (main) face gets a BIG crown,
 * side clones get progressively smaller crowns based on distance from center.
 */
export function RavansFaces({ className }: RavansFacesProps) {
  // 4 on left, 5 on right
  const leftFaces = Array.from({ length: 4 }, (_, i) => -4 + i);
  const rightFaces = Array.from({ length: 5 }, (_, i) => 1 + i);
  const faces = [...leftFaces, ...rightFaces]; // -4, -3, -2, -1, 1, 2, 3, 4, 5
  const mainFacePos = 0; // center / main face slot

  // include the main face explicitly so it renders (and gets the big crown)
  const allPositions = [mainFacePos, ...faces];

  return (
    <div className={className} style={{ pointerEvents: 'none' }}>
      <svg viewBox="0 0 100 100" className="w-full h-full opacity-25">
        {allPositions.map((pos, i) => {
          const x = 50 + pos * 10; // spacing
          const y = 50;
          const isMain = pos === mainFacePos;

          // Crown scale: main face gets the biggest crown (1.4x),
          // clones shrink slightly the further they are from center.
          const crownScale = isMain ? 1.4 : Math.max(0.6, 1 - Math.abs(pos) * 0.06);
          const rx = isMain ? 5 : 4;
          const ry = isMain ? 6.5 : 5.5;

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
              <ellipse cx="0" cy="0" rx={rx} ry={ry} fill="#ffffff" opacity={isMain ? 0.85 : 0.6} />
              {/* Crown sits just above the top of the face ellipse (cy - ry) */}
              <g transform={`translate(0, ${-ry})`}>
                <Crown scale={crownScale} />
              </g>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Draws a stylized 5-point crown on a canvas, centered horizontally on
 * (centerX, topY), sized relative to `width` (the width of the face it
 * sits above). topY should be the TOP of the head so the crown's base
 * band rests right at the hairline.
 *
 * @param ctx - Canvas 2D context
 * @param centerX - horizontal center of the face
 * @param topY - top-of-head Y coordinate (crown's bottom edge sits here)
 * @param width - reference width (face width) used to scale the crown
 * @param alpha - opacity (0-1)
 */
export function drawCrown(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  topY: number,
  width: number,
  alpha: number = 1
) {
  const crownWidth = width * 0.85;
  const crownHeight = crownWidth * 0.55;
  const bandHeight = crownHeight * 0.28;

  const left = centerX - crownWidth / 2;
  const right = centerX + crownWidth / 2;
  const baseY = topY;
  const bandTopY = baseY - bandHeight;
  const spikeTopY = bandTopY - (crownHeight - bandHeight);

  ctx.save();
  ctx.globalAlpha = alpha;

  // --- Crown body (band + 5 spikes) ---
  ctx.beginPath();
  ctx.moveTo(left, baseY);
  ctx.lineTo(left, bandTopY);

  const numSpikes = 5;
  const segW = crownWidth / numSpikes;
  for (let i = 0; i < numSpikes; i++) {
    const x0 = left + i * segW;
    const xMid = x0 + segW / 2;
    const x1 = x0 + segW;
    const distFromCenter = Math.abs(i - (numSpikes - 1) / 2);
    const peakY = spikeTopY + distFromCenter * (crownHeight * 0.18);
    ctx.lineTo(xMid, peakY);
    ctx.lineTo(x1, bandTopY);
  }

  ctx.lineTo(right, baseY);
  ctx.closePath();

  const grad = ctx.createLinearGradient(left, spikeTopY, left, baseY);
  grad.addColorStop(0, '#FFE9A8');
  grad.addColorStop(0.5, '#FFC94A');
  grad.addColorStop(1, '#E8A317');
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.lineWidth = Math.max(1, crownWidth * 0.015);
  ctx.strokeStyle = '#B8860B';
  ctx.stroke();

  // --- Base band highlight ---
  ctx.beginPath();
  ctx.rect(left, bandTopY, crownWidth, bandHeight);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fill();

  // --- Gems: one on each spike tip ---
  const gemRadiusBase = crownWidth * 0.045;
  const gemColors = ['#E63946', '#2A9D8F', '#3A86FF', '#2A9D8F', '#E63946'];
  for (let i = 0; i < numSpikes; i++) {
    const x0 = left + i * segW;
    const xMid = x0 + segW / 2;
    const distFromCenter = Math.abs(i - (numSpikes - 1) / 2);
    const peakY = spikeTopY + distFromCenter * (crownHeight * 0.18);
    const r = gemRadiusBase * (1 - distFromCenter * 0.12);

    ctx.beginPath();
    ctx.arc(xMid, peakY, r, 0, Math.PI * 2);
    ctx.fillStyle = gemColors[i];
    ctx.fill();
    ctx.lineWidth = Math.max(0.5, r * 0.18);
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.stroke();
  }

  // --- Small gems along the band ---
  const bandGemR = crownWidth * 0.025;
  const bandGemY = bandTopY + bandHeight / 2;
  for (let i = 1; i < numSpikes; i++) {
    const x = left + i * segW;
    ctx.beginPath();
    ctx.arc(x, bandGemY, bandGemR, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = alpha * 0.85;
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw the user's face multiple times in a straight line.
 * 4 on the left, 5 on the right. Every face — including the main one —
 * is topped with a crown: BIG on the main/center face, proportionally
 * smaller on each clone (matching that clone's own scaled-down size).
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

  // Scale down the cloned faces so they all fit on screen
  const drawScale = 0.60;
  const dWidth = faceWidth * drawScale;
  const dHeight = faceHeight * drawScale;

  ctx.save();

  // --- BIG crown on the main/center face first ---
  // Main face top-of-head sits at roughly centerY - faceHeight/2.
  const mainFaceTopY = centerY - faceHeight / 2;
  drawCrown(ctx, centerX, mainFaceTopY, faceWidth * 1.15, 1);

  for (let i = -numLeft; i <= numRight; i++) {
    if (i === 0) continue; // Skip the main face in the center (already drawn above)

    // Ensure faces do not overlap the main original face by starting from the edge
    const gap = 0; // small pixel gap from the main face
    let dx = 0;
    if (i > 0) {
      // Right side: start from right edge of main face
      dx = centerX + (faceWidth / 2) + gap + (i - 1) * dWidth * 0.65;
    } else {
      // Left side: start from left edge of main face, shift left by clone width
      dx = centerX - (faceWidth / 2) - gap - dWidth - (Math.abs(i) - 1) * dWidth * 0.65;
    }

    // Vertically center the scaled down faces relative to the main face
    const dy = centerY - dHeight / 2;

    if (video) {
      // Extract face from video (using original dimensions)
      const sx = Math.max(0, centerX - faceWidth / 2);
      // Shift slightly down to capture more of the face and less of the top head
      const sy = Math.max(0, centerY - faceHeight / 2 + faceSize * 0.1);

      const sWidth = Math.min(faceWidth, video.videoWidth - sx);
      const sHeight = Math.min(faceHeight, video.videoHeight - sy);

      if (sWidth > 0 && sHeight > 0) {
        const actualDWidth = sWidth * drawScale;
        const actualDHeight = sHeight * drawScale;

        ctx.save();
        // Create a rounded container (ellipse) to clip the feed
        ctx.beginPath();
        ctx.ellipse(dx + actualDWidth / 2, dy + actualDHeight / 2, actualDWidth / 2, actualDHeight / 2, 0, 0, Math.PI * 2);
        ctx.clip();

        ctx.globalAlpha = 0.85; // Make copies slightly transparent
        ctx.drawImage(video, sx, sy, sWidth, sHeight, dx, dy, actualDWidth, actualDHeight);

        ctx.restore();

        // Smaller crown on top of this clone, sized to its own width,
        // sitting right above the clipped ellipse's top edge.
        const cloneCenterX = dx + actualDWidth / 2;
        const cloneTopY = dy;
        drawCrown(ctx, cloneCenterX, cloneTopY, actualDWidth * 1.15, 0.9);
      }
    } else {
      // Fallback silhouette for demo mode
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.ellipse(dx + dWidth / 2, dy + dHeight / 2, dWidth / 2, dHeight / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Smaller crown above the silhouette clone too
      drawCrown(ctx, dx + dWidth / 2, dy, dWidth * 1.15, 0.7);
    }
  }

  ctx.restore();
}