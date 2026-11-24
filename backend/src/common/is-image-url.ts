const IMAGE_PATH = /\.(png|jpe?g|webp|gif)$/i;

/** http(s) URL whose path ends with a common image extension. */
export function isImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }
    return IMAGE_PATH.test(url.pathname);
  } catch {
    return false;
  }
}
