import { expect, test } from 'vitest';
import EventQueue from './EventQueue';
import { suika } from './proto';

test('eventqueue example', () => {
  // Arrange
  const eq = new EventQueue();

  const a = suika.event.game.GameEvent.create();
  a.id = 0;

  const b = suika.event.game.GameEvent.create();
  b.id = 1;

  const c = suika.event.game.GameEvent.create();
  c.id = 2;

  // Act
  eq.push(a);
  eq.push(c);
  eq.push(b);

  // Assert
  expect(eq.front()).toBe(a);

  eq.pop();
  expect(eq.front()).toBe(b);

  eq.pop();
  expect(eq.front()).toBe(c);

  eq.pop();
  expect(eq.front()).toBe(null);
});

test('eventqueue empty front', () => {
  const eq = new EventQueue();

  expect(eq.front()).toBe(null);
});

test('eventqueue empty pop', () => {
  const eq = new EventQueue();
  expect(() => eq.pop()).toThrowError('invalid pop operation');
});

test('eventqueue out of order events', () => {
  const eq = new EventQueue();

  const a = suika.event.game.GameEvent.create();
  a.id = 0;

  const b = suika.event.game.GameEvent.create();
  b.id = 1;

  expect(eq.empty()).toBe(true);
  expect(eq.canPop()).toBe(false);

  eq.push(b);

  expect(eq.empty()).toBe(false);
  expect(eq.canPop()).toBe(false);

  eq.push(a);

  expect(eq.empty()).toBe(false);
  expect(eq.canPop()).toBe(true);
  expect(eq.front()).toBe(a);

  eq.pop();

  expect(eq.empty()).toBe(false);
  expect(eq.canPop()).toBe(true);
  expect(eq.front()).toBe(b);

  eq.pop();

  expect(eq.empty()).toBe(true);
  expect(eq.canPop()).toBe(false);
});
