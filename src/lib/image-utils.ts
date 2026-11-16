/**
 * Crops and scales an uploaded image file into a square JPEG data URL (~256px),
 * keeping the base64 payload small (~20KB) and uniform across avatars.
 */
const PHOTO_SIDE = 256;

export async function toSquareDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = PHOTO_SIDE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, PHOTO_SIDE, PHOTO_SIDE);
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    PHOTO_SIDE,
    PHOTO_SIDE
  );
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", 0.82);
}
