/**
 * constrains a number x so that it is in the range [min, max]
 * @param x
 * @param min
 * @param max
 * @returns constrained x
 */
export function constrain(x: number, min: number, max: number) {
  return Math.min(Math.max(x, min), max);
}

/**
 * uses Jenkins' 32 bit integer hash function to hash a 32-bit integer
 * to return another 32-bit integer
 *
 * source: https://gist.github.com/badboy/6267743
 * @param a
 * @returns hashed input
 */
export function hash(a: number) {
  a = a + 0x7ed55d16 + (a << 12);
  a = a ^ 0xc761c23c ^ (a >> 19);
  a = a + 0x165667b1 + (a << 5);
  a = (a + 0xd3a2646c) ^ (a << 9);
  a = a + 0xfd7046c5 + (a << 3);
  a = a ^ 0xb55a4f09 ^ (a >> 16);
  return a;
}

/**
 * maps the fraction x/y into 32-bit representation
 * @param x
 * @param y
 * @returns 32-bit int representation of x/range
 */
export function encodeFraction(x: number, y: number) {
  return ((x / y) * 0x0fffffff) | 0;
}

/**
 * maps the 32-bit representation of x/y and y into x
 * @param xy 32-bit int representation of x/y
 * @param y
 * @returns x
 */
export function decodeFraction(xy: number, y: number) {
  return (xy * y) / 0x0fffffff;
}

/**
 * maps a number x in the range [lo, hi] with k-bit resolution
 * @param x
 * @param lo
 * @param hi
 * @param k
 * @returns k-bit resolution representation of x
 */
export function encodeRange(x: number, lo: number, hi: number, k: number) {
  x = constrain(x, lo, hi) - lo;
  return ((x / (hi - lo)) * ((1 << k) - 1)) | 0;
}

/**
 * maps an integer with k-bit resolution back into the range [lo, hi]
 * @param x
 * @param lo
 * @param hi
 * @param k
 * @returns (x / (1<<k)) * (hi - lo) + lo
 */
export function decodeRange(x: number, lo: number, hi: number, k: number) {
  return (x / (1 << k)) * (hi - lo) + lo;
}

/**
 * Maps a[i] to [i, a[i]]. You **can** mutate the array, but
 * the index won't change, and it'll continue until the end.
 * @param arr Array to enumerate
 */
export function* enumerate<T>(arr: T[]) {
  for (let i = 0; i < arr.length; ++i) {
    yield [i, arr[i]] as [number, T];
  }
}

/**
 * Returns a shuffled view of the array. Please don't modify the array.
 * @param arr Array to shuffle
 */
export function* shuffled<T>(arr: T[]) {
  const n = arr.length;
  const order = new Array(n).fill(0).map((_, i) => i);
  for (let i = 1; i < n; ++i) {
    const j = Math.floor(Math.random() * i);
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  for (const i of order) yield arr[i];
}

/**
 * Returns a random selection from the array.
 * @param arr 
 */
export function choice<T>(arr: T[]) {
  const n = arr.length;
  return arr[Math.floor(n * Math.random())];
}
