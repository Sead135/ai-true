import { isImageUrl } from "./is-image-url.js";

/** Legacy data-URL ceiling for rows written before object storage. */
const MAX_DATA_URL_LEN = 500_000;
const DATA_IMAGE = /^data:image\/(png|jpe?g|webp|gif);base64,/i;

export function isAvatarValue(value: string): boolean {
  if (DATA_IMAGE.test(value) && value.length <= MAX_DATA_URL_LEN) {
    return true;
  }
  return isImageUrl(value);
}
