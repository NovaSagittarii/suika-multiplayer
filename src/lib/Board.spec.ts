import { expect, test } from 'vitest';
import Board from './Board';

test('testing gravity', () => {
  // return; // vitest does not seem to like wasm modules
  const board = new Board();
  board.initialize(0, 10, 10);
  const ball = board.placeBall(0, 1);

  const initialY = ball.translation().y;
  board.step();

  console.log(initialY);
  console.log(ball.translation().y);
});
