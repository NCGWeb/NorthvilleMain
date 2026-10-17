import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";
import sharp from "sharp";

export type SavedUpload = { url: string; width: number | null; height: number | null; sizeBytes: number; mimeType: string };

/** Longest side kept after upload. Bigger originals are scaled down; the site never shows pictures larger than this. */
const MAX_SIDE = 2400;

/**
 * Resizes and compresses a picture, then returns the bytes plus its final size.
 * GIFs are kept as they are (resizing would drop the animation).
 */
export async function optimiseImage(file: File): Promise<{ bytes: Buffer; width: number | null; height: number | null; mimeType: string }> {
  const input = Buffer.from(await file.arrayBuffer());
  if (file.type === "image/gif") {
    const m = await sharp(input).metadata().catch(() => null);
    return { bytes: input, width: m?.width ?? null, height: m?.height ?? null, mimeType: file.type };
  }
  let img = sharp(input, { failOn: "none" }).rotate().resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true });
  if (file.type === "image/jpeg") img = img.jpeg({ quality: 82, mozjpeg: true });
  else if (file.type === "image/png") img = img.png({ compressionLevel: 9, palette: false });
  else if (file.type === "image/webp") img = img.webp({ quality: 82 });
  else if (file.type === "image/avif") img = img.avif({ quality: 60 });
  const { data, info } = await img.toBuffer({ resolveWithObject: true });
  // Never make a file bigger than what was uploaded.
  if (data.length >= input.length && info.width === (await sharp(input).metadata()).width) {
    return { bytes: input, width: info.width, height: info.height, mimeType: file.type };
  }
  return { bytes: data, width: info.width, height: info.height, mimeType: file.type };
}

/**
 * Saves an uploaded picture after resizing it. In production (BLOB_READ_WRITE_TOKEN set) it goes to
 * Vercel Blob. Locally it is written to apps/web/public/uploads so both apps
 * can show it without any cloud account.
 */
export async function saveUpload(file: File): Promise<SavedUpload> {
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "") || "file";
  const stamped = `${Date.now()}-${safe}`;
  const { bytes, width, height, mimeType } = await optimiseImage(file);
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${stamped}`, bytes, { access: "public", contentType: mimeType });
    return { url: blob.url, width, height, sizeBytes: bytes.length, mimeType };
  }
  const dir = path.resolve(process.cwd(), "../web/public/uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, stamped), bytes);
  return { url: `/uploads/${stamped}`, width, height, sizeBytes: bytes.length, mimeType };
}

/** Removes the stored file behind a picture address. Safe to call for files that are already gone. */
export async function deleteUpload(url: string): Promise<void> {
  try {
    if (/^https?:\/\//.test(url)) {
      if (process.env.BLOB_READ_WRITE_TOKEN && url.includes("blob.vercel-storage.com")) await del(url);
      return;
    }
    if (url.startsWith("/uploads/")) await unlink(path.resolve(process.cwd(), "../web/public", url.slice(1))).catch(() => {});
  } catch (e) {
    console.error("Could not delete stored file", url, e);
  }
}
