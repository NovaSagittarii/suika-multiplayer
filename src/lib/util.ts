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
 * uses Jenkins' 32 bit integer hash function to hash a 32-bit integer to return another 32-bit integer
 *
 * source: https://gist.github.com/badboy/6267743#robert-jenkins-32-bit-integer-hash-function
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
export function xdti(x: number, y: number) {
  return ((x / y) * 0x0fffffff) | 0;
}

/**
 * maps the 32-bit representation of x/y and y into x
 * @param xy 32-bit int representation of x/y
 * @param y
 * @returns x
 */
export function xitd(xy: number, y: number) {
  return (xy * y) / 0x0fffffff;
}
