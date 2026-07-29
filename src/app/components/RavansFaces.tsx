import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';

export const CROWN_IMAGE_PATH = '/crown/crown1.svg';
export const MUSTACHE_IMAGE_PATH = '/mustache/mustache1.svg';

export function useCrownImage() {
  const imageRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.onload = () => imageRef.current = img;
    img.src = CROWN_IMAGE_PATH;
  }, []);
  return imageRef.current;
}

export function useMustacheImage() {
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();

    img.onload = () => {
      imageRef.current = img;
    };

    img.src = MUSTACHE_IMAGE_PATH;
  }, []);

  return imageRef.current;
}

interface RavansFacesProps {
  className?: string;
}

/**
 * Reusable SVG crown
function Crown({ scale = 1 }: { scale?: number }) {
  const w = 10 * scale;
  const h = 10 * scale; // Assuming aspect ratio near 1:1, or SVG handles it
  return (
    <image 
      href={CROWN_IMAGE_PATH} 
      x={-w / 2} 
      y={-h} 
      width={w} 
      height={h} 
      preserveAspectRatio="xMidYMax meet" 
    />
  );
}

/**
 * Reusable SVG mustache, rendered using a custom image.
 */
function Mustache({ scale = 1 }: { scale?: number }) {
  const w = 8 * scale;
  const h = 4 * scale;
  return (
    <image
      href={MUSTACHE_IMAGE_PATH}
      x={-w / 2}
      y={0}
      width={w}
      height={h}
      preserveAspectRatio="xMidYMin meet"
    />
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
              {/* Mustache sits just below center of the face ellipse */}
              <g transform={`translate(0, ${ry * 0.15})`}>
                <Mustache scale={crownScale * 0.8} />
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
  crownImage: HTMLImageElement | null,
  centerX: number,
  topY: number,
  width: number,
  alpha: number = 1
) {
  if (!crownImage) return;

  const crownWidth = width * 2;
  // Calculate height to maintain aspect ratio
  const crownHeight =
    crownWidth * (crownImage.height / crownImage.width);
  ctx.save();
  ctx.globalAlpha = alpha;

  // Draw the image centered horizontally, sitting right on topY
  ctx.drawImage(
    crownImage,
    centerX - crownWidth / 2,
    topY - crownHeight + crownHeight * 0.20,
    crownWidth,
    crownHeight
  );

  ctx.restore();
}

/**
 * Draws a mustache on a canvas using a custom image, centered horizontally
 * on (centerX, noseY), sized relative to `width`.
 *
 * @param ctx - Canvas 2D context
 * @param mustacheImage - Preloaded HTMLImageElement of the mustache
 * @param centerX - horizontal center of the face
 * @param noseY - Y coordinate of the nose area (mustache top edge sits here)
 * @param width - reference width (face width) used to scale the mustache
 * @param alpha - opacity (0-1)
 */
export function drawMustache(
  ctx: CanvasRenderingContext2D,
  mustacheImage: HTMLImageElement | null,
  centerX: number,
  noseY: number,
  width: number,
  alpha: number = 1
) {
  if (!mustacheImage) return;

  const mustacheWidth = width * 0.75; // was 0.55
  const mustacheHeight =
    mustacheWidth * (mustacheImage.height / mustacheImage.width);

  ctx.save();
  ctx.globalAlpha = alpha;

  // Draw the image centered horizontally, top edge at noseY
  ctx.drawImage(
    mustacheImage,
    centerX - mustacheWidth / 2,
    noseY,
    mustacheWidth,
    mustacheHeight
  );

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
  frame: number,
  crownImage: HTMLImageElement | null,
  mustacheImage: HTMLImageElement | null
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
  drawCrown(ctx, crownImage, centerX, mainFaceTopY, faceWidth * 1.15, 1);

  // --- Mustache on the main/center face ---
  const mainMustacheY = centerY + faceHeight * 0.14;
  drawMustache(ctx, mustacheImage, centerX, mainMustacheY, faceWidth, 1);

  for (let i = -numLeft; i <= numRight; i++) {
    if (i === 0) continue; // Skip the main face in the center (already drawn above)

    // Ensure faces do not overlap the main original face by starting from the edge
    const gap = 0; // small pixel gap from the main face
    let dx = 0;
    if (i > 0) {
      // Right side: start from right edge of main face
      dx = centerX + (faceWidth / 2) - gap + (i - 1) * dWidth * 0.65;
    } else {
      // Left side: start from left edge of main face, shift left by clone width
      dx = centerX - (faceWidth / 2) - gap - dWidth - (Math.abs(i) - 1.2) * dWidth * 0.65;
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
        drawCrown(ctx, crownImage, cloneCenterX, cloneTopY, actualDWidth * 0.7, 0.9);

        // Mustache on clone
        const cloneMustacheY = dy + actualDHeight * 0.60;
        drawMustache(ctx, mustacheImage, cloneCenterX, cloneMustacheY, actualDWidth, 0.9);
      }
    } else {
      // Fallback silhouette for demo mode
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.ellipse(dx + dWidth / 2, dy + dHeight / 2, dWidth / 2, dHeight / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Smaller crown above the silhouette clone too
      drawCrown(ctx, crownImage, dx + dWidth / 2, dy, dWidth * 0.8,
        0.7);

      // Mustache on silhouette clone
      drawMustache(ctx, mustacheImage, dx + dWidth / 2, dy + dHeight * 0.60, dWidth, 0.7);
    }
  }

  ctx.restore();
}