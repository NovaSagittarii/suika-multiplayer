import * as RAPIER from '@dimforge/rapier2d/rapier';
const Rapier = await import('@dimforge/rapier2d');

import { BOARD_GRAVITY, FRUIT_RADIUS, FRUIT_TYPES } from '../constants';
import DynamicEntity, { ColliderHandlerMap } from './DynamicEntity';
import Ball, { BallRenderProps } from './Ball';
import Wall from './Wall';
import { constrain, hash, xitd } from './util';
import { BufferedEvents } from './BufferedEvents';
import { suika } from './proto';

export default class Board extends BufferedEvents {
  private world: RAPIER.World;
  private balls: ColliderHandlerMap = new Map();
  private walls: Wall[] = [];

  private score: number = 0;
  private ballsPlaced: number = 0;

  /**
   * the largest ball; used in randomizer
   */
  private largestBall: number = 0;

  /**
   * where the next ball will be placed (constrained by this.nextBall)
   */
  private inputX: number = 0;

  /**
   * next ball determined by the randomizer
   */
  private nextBall: number = 0;

  /**
   * randomizer state
   */
  private seed: number = -1 | 0;

  private ticks: number = 0;

  private width: number = 0;
  private height: number = 0;
  private id: number = -1;

  constructor() {
    super();
    this.world = new Rapier.World(new Rapier.Vector2(0, -BOARD_GRAVITY));
  }

  getWalls() {
    return this.walls.map((wall) => wall.renderProps());
  }

  getBalls() {
    const balls: BallRenderProps[] = [];
    for (const ball of this.balls.values()) {
      balls.push((ball as Ball).renderProps());
    }
    return balls;
  }

  public getWidth() {
    return this.width;
  }

  public getHeight() {
    return this.height;
  }

  public getNextBall() {
    return this.nextBall;
  }

  public getInputX() {
    return this.inputX;
  }

  public getTicks() {
    return this.ticks;
  }

  public getId() {
    return this.id;
  }

  public isInitialized() {
    return this.id !== -1;
  }

  /**
   * Drains events up until the current tick.
   */
  drainEvents(): void {
    const q = this.eventBuffer;
    while (q.canPop() && q.front()!.ticks <= this.ticks) {
      const event = q.front();
      q.pop();
      switch (event?.event) {
        case 'place':
          this.place(xitd(event.place!.x!, this.width));
          break;
        case 'placing':
          this.setInputX(xitd(event.placing!.x!, this.width));
          break;
        case 'receive':
          break;
      }
    }
  }

  /**
   * initialize the board with a set configuration
   * @param seed seed to initialize board with
   * @param width width of the board in meters
   * @param height height of the board in meters
   * @param id board id (used in event.target to reference itself)
   */
  initialize(seed: number, width: number, height: number, id: number) {
    this.seed = seed | 0;
    this.walls.push(new Wall(this.world, -width / 2 - 1, 0, 1, height * 2));
    this.walls.push(new Wall(this.world, width / 2 + 1, 0, 1, height * 2));
    this.walls.push(new Wall(this.world, 0, -height - 1, width, 1));
    this.width = width;
    this.height = height;
    this.id = id;
  }

  /**
   * calls the hash function to randomize the next ball
   */
  randomizeNextBall() {
    const largestAllowed = Math.max(0, this.largestBall - 2);
    this.nextBall = Math.abs(this.seed) % (largestAllowed + 1);
    this.seed = hash(this.seed);
  }

  /**
   * sets the placing location of the next ball, constrains value
   * @param x where along the x-axis to place the next ball (0 is the center)
   */
  setInputX(x: number) {
    return (this.inputX = constrain(
      x,
      -this.width / 2 + FRUIT_RADIUS[this.nextBall],
      this.width / 2 - FRUIT_RADIUS[this.nextBall],
    ));
  }

  /**
   * places the next ball; which ball is determined by the randomizer state
   * @param x where along the x-axis to place the next ball (0 is the center)
   */
  place(x: number) {
    x = this.setInputX(x);
    this.placeBall(x, this.nextBall);
    ++this.ballsPlaced;
    this.randomizeNextBall();
  }

  /**
   * places the next ball
   * @param x where along the x-axis to place the next ball (0 is the center)
   * @param ball_type what ball type to use
   */
  placeBall(x: number, ball_type: number) {
    if (ball_type < 0 || ball_type >= FRUIT_TYPES) throw 'invalid ball_type';
    const ball = new Ball(this.world, x, FRUIT_RADIUS[ball_type], ball_type);
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
      if (!this.balls.has(handle1) || !this.balls.has(handle2)) return;
      const o1 = this.balls.get(handle1) as Ball;
      const o2 = this.balls.get(handle2) as Ball;
      /* Handle collision event. */
      // console.log(started ? 'together' : 'apart', o1, o2);
      if (started) {
        this.mergeBalls(o1, o2);
      }
    });
    eventQueue.drainContactForceEvents((event) => {
      let handle1 = event.collider1(); // Handle of the first collider involved in the event.
      let handle2 = event.collider2(); // Handle of the second collider involved in the event.
      /* Handle the contact force event. */
    });
    ++this.ticks;
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
    const lowercoords =
      ball1.translation().y < ball2.translation().y
        ? ball1.translation()
        : ball2.translation();
    const { x, y } = lowercoords;
    ball1.dispose();
    ball2.dispose();
    if (type < FRUIT_TYPES - 1) {
      // apparently two watermelons disappear
      const newBall = new Ball(this.world, x, y, type + 1);
      newBall.attachCollider(this.balls);
      this.largestBall = Math.max(this.largestBall, type + 1);
    }
  }

  /**
   * steps the board by one tick up to the latest known state
   * @returns whether ticks was updated or not
   */
  tick() {
    const event = this.eventBuffer.front();
    if (event) {
      if (event.ticks > this.ticks) {
        // can advance simulation
        this.step();
        return true;
      } else if (event.ticks == this.ticks) {
        // event to process
        this.drainEvents();
      }
    }
    return false;
  }

  /**
   * creates an event that happens in (offset) ticks
   * @param offset positive number
   */
  createEvent(offset: number = 1) {
    if (offset <= 0) throw 'Board::createEvent - offset must be positive';
    if (this.id < 0) throw 'Board::createEvent - board is not initialized';
    const event = suika.event.game.GameEvent.create();
    event.ticks = this.ticks + offset;
    event.target = this.id;
    return event;
  }
}
