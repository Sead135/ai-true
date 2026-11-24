/** Stable 32-bit FNV-1a so seed/re-sync stays reproducible. */
export function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function between(h: number, min: number, max: number): number {
  return min + (h % (max - min + 1));
}
