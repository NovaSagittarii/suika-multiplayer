export function constrain(x: number, min: number, max: number) {
  return Math.min(Math.max(x, min), max);
}
