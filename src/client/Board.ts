import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  FRUIT_DIAMETER,
  FRUIT_RADIUS,
} from '@/constants';
import { constrain } from '@/lib/util';
import SuikaBoard from '@/suika/SuikaBoard';
import p5 from 'p5';

/**
 * Draws a ball at the specified location. The ball color is the current
 * fill color (assumed a bright color). The text is always black.
 * @param p5 p5 instance
 * @param x
 * @param y
 * @param type
 * @param active
 */
function drawBall(
  p5: p5,
  x: number,
  y: number,
  type: number,
  active: boolean = true,
) {
  p5.ellipse(x, y, FRUIT_DIAMETER[type], FRUIT_DIAMETER[type]);
  if (active) {
    p5.fill(0);
    p5.text(type, x, y);
  }
}

/**
 * Draws a board horizontally centered at x=0, top aligned to y=0.
 * @param p5 p5 instance
 * @param boardParameters board data
 * @param extra whether to render additional GUI
 */
export default function drawBoard(
  p5: p5,
  [nx, nextBall, balls, danger]: ReturnType<typeof SuikaBoard.deserialize>,
  extra: boolean = false,
) {
  // constrain nx here (has to be done *somewhere*, but this works for now)
  const R = FRUIT_RADIUS[nextBall];
  nx = constrain(nx, -BOARD_WIDTH / 2 + R, BOARD_WIDTH / 2 - R);

  p5.textSize(1.2);

  p5.fill(0, 255, 0, 100);
  drawBall(p5, nx, 0, nextBall);

  p5.fill(0, 10);
  p5.rect(0, BOARD_HEIGHT / 2, BOARD_WIDTH, BOARD_HEIGHT);

  p5.fill(255, 0, 0, 100);
  const d = danger / 60;
  p5.rect((-BOARD_WIDTH / 2) * (1 - d), BOARD_HEIGHT + 1, BOARD_WIDTH * d, 2);

  for (const [x, y, t, a] of balls) {
    if (a) {
      p5.fill(255, 0, 0, 100);
    } else {
      p5.fill(0, 100);
    }
    drawBall(p5, x, -y, t, a);
  }

  // compute raycast for x=nx; where is the predicted first collision?
  if (extra) {
    const R = FRUIT_RADIUS[nextBall];
    let h = BOARD_HEIGHT - R;
    for (const [x, y, t] of balls) {
      const r = FRUIT_RADIUS[t];
      const dx = Math.abs(x - nx); // very basic raycast (does not cast circle)
      if (dx <= r) {
        // x^2 + y^2 = r^2
        // x is fixed, solve for y
        // y^2 = r^2 - x^2
        // but only care about the higher one
        const iy = -y - Math.sqrt(r * r - dx * dx) - R;
        h = Math.min(h, iy);
      }
    }
    p5.push();
    p5.noFill();
    p5.stroke(0, 40);
    p5.strokeWeight(0.1);
    p5.line(nx, 0, nx, h);
    p5.ellipse(nx, h, R * 2, R * 2);
    p5.pop();
  }
}
