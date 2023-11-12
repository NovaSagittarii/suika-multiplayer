import Ball from './Ball';

import * as RAPIER from '@dimforge/rapier2d/rapier';
import DynamicEntity, { ColliderHandlerMap } from './DynamicEntity';
import Wall from './Wall';
const Rapier = await import('@dimforge/rapier2d');

export default class Board {
  private world: RAPIER.World;
  private balls: ColliderHandlerMap = new Map();
  private walls: Wall[] = [];

  private score: number = 0;
  private ballsPlaced: number = 0;
  private seed: number = -1;

  private ticks: number = 0;
  private events: number = 0;

  private width: number = 0;
  private height: number = 0;

  constructor() {
    this.world = new Rapier.World(new Rapier.Vector2(0, -9.81));
  }

  getWalls() {
    return this.walls;
  }

  getBalls() {
    return this.balls;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  /**
   * initialize the board with a set configuration
   * @param seed seed to initialize board with
   * @param width width of the board in meters
   * @param height height of the board in meters
   */
  initialize(seed: number, width: number, height: number) {
    this.seed = seed | 0;
    this.walls.push(new Wall(this.world, -width / 2 - 1, 0, 1, height * 2));
    this.walls.push(new Wall(this.world, width / 2 + 1, 0, 1, height * 2));
    this.walls.push(new Wall(this.world, 0, -height - 1, width, 1));
    this.width = width;
    this.height = height;
  }

  /**
   * places the next ball; which ball is determined by the randomizer state
   * @param x where along the x-axis to place the next ball (0 is the center)
   */
  place(x: number) {
    this.placeBall(x, 0);
    ++this.ballsPlaced;
  }

  /**
   * places the next ball
   * @param x where along the x-axis to place the next ball (0 is the center)
   * @param ball_type what ball type to use
   */
  placeBall(x: number, ball_type: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10) {
    const ball = new Ball(this.world, x, 0.5, ball_type);
    ball.attachCollider(this.balls);
    return ball;
  }

  /**
   * advance board state
   */
  step() {
    const eventQueue = new Rapier.EventQueue(true);
    this.world.step(eventQueue);
    eventQueue.drainCollisionEvents((handle1, handle2, started) => {
      const o1 = this.balls.get(handle1);
      const o2 = this.balls.get(handle2);
      /* Handle collision event. */
    });
    eventQueue.drainContactForceEvents((event) => {
      let handle1 = event.collider1(); // Handle of the first collider involved in the event.
      let handle2 = event.collider2(); // Handle of the second collider involved in the event.
      /* Handle the contact force event. */
    });
  }

  /**
   * merges two balls
   * @param ball1 first ball to merge
   * @param ball2 second ball to merge
   */
  mergeBalls(ball1: Ball, ball2: Ball) {
    if (ball1.type !== ball2.type) {
      throw new Error('cannot merge balls of different types');
    }
    const type = ball1.type;
    const x = (ball1.x + ball2.x) / 2;
    const y = (ball1.y + ball2.y) / 2;
    ball1.dispose();
    ball2.dispose();
    const newBall = new Ball(this.world, x, y, type + 1);
    newBall.attachCollider(this.balls);
  }
}
