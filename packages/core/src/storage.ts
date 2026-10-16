import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

/**
 * Saves an uploaded file. In production (BLOB_READ_WRITE_TOKEN set) it goes to
 * Vercel Blob. Locally it is written to apps/web/public/uploads so both apps
 * can show it without any cloud account.
 */
export async function saveUpload(file: File): Promise<string> {
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "") || "file";
  const stamped = `${Date.now()}-${safe}`;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${stamped}`, file, { access: "public" });
    return blob.url;
  }
  const dir = path.resolve(process.cwd(), "../web/public/uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, stamped), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${stamped}`;
}
