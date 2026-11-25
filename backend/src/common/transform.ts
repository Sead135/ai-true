export type TransformValueParams = {
  value: unknown;
};

export function emptyToUndefined({ value }: TransformValueParams): unknown {
  if (value === "" || value === null) {
    return undefined;
  }
  return value;
}
