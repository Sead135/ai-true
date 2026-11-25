import { isImageUrl } from "./is-image-url";

/** ~350KB raw → data URL ceiling for MVP avatar uploads. */
const MAX_DATA_URL_LEN = 500_000;
const DATA_IMAGE = /^data:image\/(png|jpe?g|webp|gif);base64,/i;

export function isAvatarValue(value: string): boolean {
  if (DATA_IMAGE.test(value) && value.length <= MAX_DATA_URL_LEN) {
    return true;
  }
  return isImageUrl(value);
}
