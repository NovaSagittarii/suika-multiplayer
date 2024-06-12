import Rapier from '@/lib/RapierInstance';
import { expect, test } from 'vitest';
import Ball from '@/suika/Ball';

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
