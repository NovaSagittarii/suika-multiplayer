import { expect, test } from 'vitest';

import SuikaBoard from '@/suika/SuikaBoard';

test('balls merge when over each other', () => {
  const game = new SuikaBoard();
  game.createBall(0, 0, 0);
  game.createBall(0, 0, 0);
  expect(game.getBalls().length).toBe(2);
  game.step();
  expect(game.getBalls().length).toBe(1);
});
