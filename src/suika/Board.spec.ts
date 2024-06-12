import { expect, test } from 'vitest';

import Rapier from '@/lib/RapierInstance';
import Ball from '@/suika/Ball';
import Board from '@/suika/Board';

// Note: normal rapier doesn't really work with vitest.
// you need rapier-compat so it works

test('balls fall due to gravity', () => {
  const world = new Rapier.World(new Rapier.Vector2(0, 9.81));
  const ball = new Ball(world, 0, 0, 1);
  expect(ball.translation().x).toBe(0);
  expect(ball.translation().y).toBe(0);
  world.step();
  expect(ball.translation().x).toBe(0);
  expect(ball.translation().y).not.toBe(0);
});

test('balls fall and then fall to opposite sides', () => {
  const board = new Board();
  const a = board.createBall(0, 10, 0);
  const b = board.createBall(0.05, 8, 0);
  expect(a.translation().x).toBe(0);
  expect(b.translation().x).toBeCloseTo(0.05);

  // This assumes the balls will have fallen and collided within 100 time steps.
  for (let i = 0; i < 100; ++i) board.step();
  // for (let i = 0; i < 1000; ++i) {
  //   if (i % 100 === 0) console.log(a.translation().x, b.translation().x);
  //   board.step();
  // }

  expect(a.translation().x).toBeLessThan(0);
  expect(b.translation().x).toBeGreaterThan(0.1);
});
