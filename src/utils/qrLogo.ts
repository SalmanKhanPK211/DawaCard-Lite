import QRCode from 'qrcode';

/**
 * Generates a high-resolution QR code with the DawaCard Lite brand logo in the center.
 * Uses Reed-Solomon Error Correction Level 'H' (High - up to 30% damage tolerance)
 * so scanning remains 100% reliable even with the logo in the center.
 */
export async function generateBrandedQRCode(
  text: string,
  size = 320
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  // 1. Draw QR code with High error correction
  await QRCode.toCanvas(canvas, text, {
    width: size,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: {
      dark: '#0F172A',
      light: '#FFFFFF',
    },
  });

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas.toDataURL('image/png');

  // 2. Compute center coordinates and badge dimensions (22% of QR size)
  const cx = size / 2;
  const cy = size / 2;
  const badgeSize = Math.round(size * 0.23);
  const badgeRadius = Math.round(badgeSize / 2);

  // 3. Draw outer white background circle to clear QR dots
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, badgeRadius + 4, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#E2E8F0';
  ctx.stroke();

  // 4. Draw teal circle brand container
  ctx.beginPath();
  ctx.arc(cx, cy, badgeRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#0F766E';
  ctx.fill();

  // 5. Draw crisp white pill logo icon in the center
  const pillLength = badgeSize * 0.55;
  const pillRadius = pillLength * 0.26;

  ctx.translate(cx, cy);
  ctx.rotate(-Math.PI / 4); // 45-degree angle

  // Pill outer capsule
  ctx.beginPath();
  ctx.fillStyle = '#FFFFFF';
  ctx.roundRect(
    -pillLength / 2,
    -pillRadius,
    pillLength,
    pillRadius * 2,
    pillRadius
  );
  ctx.fill();

  // Pill dividing cut line
  ctx.beginPath();
  ctx.strokeStyle = '#0F766E';
  ctx.lineWidth = Math.max(1.5, Math.round(size * 0.008));
  ctx.moveTo(0, -pillRadius);
  ctx.lineTo(0, pillRadius);
  ctx.stroke();

  ctx.restore();

  return canvas.toDataURL('image/png');
}
