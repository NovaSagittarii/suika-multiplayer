export const BOARD_WIDTH = 14;
export const BOARD_HEIGHT = 24;
export const BOARD_GRAVITY = 48;

/**
 * fruit diameters (in meters, for rapier)
 * source: https://github.com/ionxeph/suika/blob/master/src/constants.rs#L77
 */
export const FRUIT_DIAMETER = [
  1, 1.5, 2.1, 2.4, 3.0, 3.6, 3.8, 5.1, 6.1, 6.9, 8.1,
];

/**
 * fruit radii (in meters), calculated from FRUIT_DIAMETER
 */
export const FRUIT_RADIUS = FRUIT_DIAMETER.map((x) => x / 2);
export const FRUIT_TYPES = FRUIT_DIAMETER.length;
