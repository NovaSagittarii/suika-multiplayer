import { expect, test } from 'vitest';
import Board from './Board';

test('testing gravity', () => {
  // return; // vitest does not seem to like wasm modules
  const board = new Board();
  board.initialize(0, 10, 10);
  const ball = board.placeBall(0, 0);

  let prev = ball.translation().y;

  // falling
  for (let t = 0; t < 50; ++t) {
    board.step();
    // console.log(t, ball.translation());
    expect(ball.translation().y).lessThan(prev, 'ball should be falling');
    prev = ball.translation().y;
  }

  // wait until it stops
  for (let t = 0; t < 1000; ++t) {
    board.step();
  }

  expect(ball.translation().y).lessThan(
    -9.94,
    'should be resting on the bottom now',
  );
  expect(ball.translation().y).greaterThan(
    -10,
    'should not have passed through the bottom',
  );
});
