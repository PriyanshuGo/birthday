export const drawBirthdayCake = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, lit: boolean, frame: number) => {
  const cakeHeight = size * 0.6;
  const cakeWidth = size;

  ctx.fillStyle = '#FFB6C1';
  ctx.fillRect(x - cakeWidth / 2, y, cakeWidth, cakeHeight * 0.6);

  ctx.fillStyle = '#FFF0F5';
  ctx.fillRect(x - cakeWidth / 2, y, cakeWidth, cakeHeight * 0.2);

  const numCandles = 3;
  const candleSpacing = cakeWidth / (numCandles + 1);

  for (let i = 0; i < numCandles; i++) {
    const candleX = x - cakeWidth / 2 + candleSpacing * (i + 1);
    const candleY = y - cakeHeight * 0.3;

    ctx.fillStyle = '#FFD700';
    ctx.fillRect(candleX - 3, candleY, 6, cakeHeight * 0.3);

    if (lit) {
      const flicker = Math.sin(frame * 0.1 + i) * 2;
      const gradient = ctx.createRadialGradient(candleX + flicker, candleY - 5, 0, candleX, candleY - 5, 10);
      gradient.addColorStop(0, '#FFF');
      gradient.addColorStop(0.3, '#FFD700');
      gradient.addColorStop(0.6, '#FF6347');
      gradient.addColorStop(1, 'rgba(255,99,71,0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(candleX + flicker * 0.5, candleY - 5, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(candleX, candleY - 8, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(128,128,128,0.5)';
      ctx.beginPath();
      ctx.arc(candleX, candleY - 10, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = '#FF69B4';
  for (let i = 0; i < 5; i++) {
    const dotX = x - cakeWidth / 2 + (cakeWidth / 5) * i;
    const dotY = y + cakeHeight * 0.4;
    ctx.beginPath();
    ctx.arc(dotX + cakeWidth / 10, dotY, 3, 0, Math.PI * 2);
    ctx.fill();
  }
};
