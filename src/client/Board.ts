import { BOARD_HEIGHT, BOARD_WIDTH, FRUIT_DIAMETER } from '@/constants';
import p5 from 'p5';

/**
 * Draws a ball at the specified location. The ball color is the current
 * fill color (assumed a bright color). The text is always black.
 * @param p5 p5 instance
 * @param x
 * @param y
 * @param type
 */
function drawBall(p5: p5, x: number, y: number, type: number) {
  p5.ellipse(x, y, FRUIT_DIAMETER[type], FRUIT_DIAMETER[type]);
  p5.fill(0);
  p5.text(type, x, y);
}

interface BoardParameters {
  /**
   * Next move position
   */
  nx: number;

  /**
   * Next ball type
   */
  nextBall: number;

  /**
   * List of balls [x, y, type]
   */
  balls: [number, number, number][];
}

/**
 * Draws a board horizontally centered at x=0, top aligned to y=0.
 * @param p5 p5 instance
 * @param boardParameters board data
 */
export default function drawBoard(
  p5: p5,
  { balls, nextBall, nx }: BoardParameters,
) {
  p5.textSize(1.2);

  p5.fill(0, 255, 0, 100);
  drawBall(p5, nx, 0, nextBall);

  p5.fill(0, 10);
  p5.rect(0, BOARD_HEIGHT / 2, BOARD_WIDTH, BOARD_HEIGHT);

  for (const [x, y, t] of balls) {
    p5.fill(255, 0, 0, 100);
    drawBall(p5, x, -y, t);
  }
}
