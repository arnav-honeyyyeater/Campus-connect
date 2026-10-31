import sharp from "sharp";
import { ApiException } from "@/lib/api";

export async function sanitizeImage(buffer: Buffer, purpose: string) {
  const image = sharp(buffer, { limitInputPixels: 24_000_000 }); const meta = await image.metadata();
  if (!meta.width || !meta.height) throw new ApiException(400, "BAD_REQUEST", "The uploaded file is not a valid image.");
  const pipeline = image.rotate();
  if (purpose === "sticker") return { bytes: await pipeline.resize(512, 512, { fit: "inside", withoutEnlargement: true }).png({ compressionLevel: 9 }).toBuffer(), extension: "png", mimeType: "image/png" };
  if (purpose === "avatar") return { bytes: await pipeline.resize(512, 512, { fit: "cover" }).webp({ quality: 85 }).toBuffer(), extension: "webp", mimeType: "image/webp" };
  return { bytes: await pipeline.resize(2048, 2048, { fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer(), extension: "webp", mimeType: "image/webp" };
}
