import { api } from "./api";

export type UploadKind = "avatar" | "logo";

type PresignResponse = {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  headers: Record<string, string>;
};

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ALLOWED.has(file.type)) {
    return "Нужен файл изображения (PNG, JPG, WebP, GIF)";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "Максимум 5 МБ";
  }
  return null;
}

/** Presign → PUT to Neon Object Storage → public URL. */
export async function uploadImage(kind: UploadKind, file: File): Promise<string> {
  const invalid = validateImageFile(file);
  if (invalid) throw { status: 400, message: invalid };

  const { uploadUrl, publicUrl, headers } = await api<PresignResponse>("/uploads/presign", {
    method: "POST",
    body: JSON.stringify({
      kind,
      contentType: file.type,
      contentLength: file.size,
    }),
  });

  const put = await fetch(uploadUrl, {
    method: "PUT",
    headers,
    body: file,
  });
  if (!put.ok) {
    throw { status: put.status, message: "Не удалось загрузить файл в хранилище" };
  }

  return publicUrl;
}
