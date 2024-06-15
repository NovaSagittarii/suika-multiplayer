import { expect, test } from 'vitest';

import SuikaBoard from '@/suika/SuikaBoard';

test('balls merge when over each other', () => {
  const game = new SuikaBoard();
  game.createBall(0, 0, 0);
  game.createBall(0, 0, 0);
  expect(game.getBalls().length).toBe(2);
  game.step();
  expect(game.getBalls().length).toBe(1);
  game.free();
});

test('method clearNearbyGarbage -- clears 1 garbage', () => {
  const game = new SuikaBoard();
  expect(game.getBalls().length).toBe(0);
  game.createGarbage(0, 0, 0);
  expect(game.getBalls().length).toBe(1);
  game.clearNearbyGarbage(0, 0, 0);
  expect(game.getBalls().length).toBe(0);
  game.free();
});

test('method clearNearbyGarbage -- clears many garbage', () => {
  const game = new SuikaBoard();
  for (let i = 0; i < 100; ++i) {
    expect(game.getBalls().length).toBe(i);
    game.injectGarbage(0);
  }
  game.clearNearbyGarbage(0, 0, 1e9);
  expect(game.getBalls().length).toBe(0);
  game.free();
});

test('method clearNearbyGarbage -- does not clear normal ball', () => {
  const game = new SuikaBoard();
  expect(game.getBalls().length).toBe(0);
  game.placeBall(0);
  expect(game.getBalls().length).toBe(1);
  game.clearNearbyGarbage(0, 0, 1e9);
  expect(game.getBalls().length).toBe(1);
  game.free();
});

test('clears nearby garbage upon merge', () => {
  const game = new SuikaBoard();
  
  // put garbage at bottom first
  game.createGarbage(-0.5, 0, 0);
  game.createGarbage(0.5, 0, 0);
  expect(game.getBalls().length).toBe(2);
  
  // spawn both balls such that they are touching the garbage
  // note: type 0 has radius=1.
  game.createBall(0, 0, 0);
  game.createBall(0, 0, 0);
  expect(game.getBalls().length).toBe(4);

  game.step();
  expect(game.getBalls().length).toBe(1);

  game.free();
});

test('does not clear far away garbage upon merge', () => {
  const game = new SuikaBoard();
  
  // put garbage at bottom first
  game.createGarbage(0, -100, 0);
  expect(game.getBalls().length).toBe(1);
  
  // spawn both balls such that they are touching the garbage
  // note: type 0 has radius=1.
  game.createBall(0, 0, 0);
  game.createBall(0, 0, 0);
  expect(game.getBalls().length).toBe(3);

  game.step();
  expect(game.getBalls().length).toBe(2);

  game.free();
});
