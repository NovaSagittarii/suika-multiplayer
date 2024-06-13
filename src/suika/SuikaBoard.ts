import { EventEmitter } from 'events';
// TODO: somehow separate the EventEmitter from node:events from here
// so that client can call deserialize without needing to have the
// EventEmitter when it tries to call SuikaBoard.deserialize

import DynamicEntity, { ColliderHandlerMap } from '@/lib/DynamicEntity';
import Rapier from '@/lib/RapierInstance';
import Board from '@/suika/Board';
import Ball from '@/suika/Ball';
import { BOARD_HEIGHT, BOARD_WIDTH, FRUIT_TYPES } from '@/constants';
import { constrain, encodeRange, hash } from '@/lib/util';

// TODO: fix event typing
interface SuikaBoardEvents {
  // Events
  /**
   * Called when a merge happens
   */
  on(event: 'merge', cb: (mergeType: number) => void): this;

  emit(event: 'merge', mergeType: number): boolean;
}

/**
 * Represents one full game. This handles the game logic.
 */
class SuikaBoard extends EventEmitter implements SuikaBoardEvents {
  private board: Board;

  /**
   * Map of active colliders. When balls tracked here collide with
   * the same radius, they'll merge. If you spawn a ball without
   * tracking it, then it can't merge.
   */
  private colliders: ColliderHandlerMap = new Map<number, DynamicEntity>();

  /**
   * rapier events to get processed
   */
  private eventQueue = new Rapier.EventQueue(true);

  /**
   * the largest ball created, this determines the balls that can spawn
   */
  private largestBall = 0;

  /**
   * x-position to place the next ball
   */
  private nx = 0;

  /**
   * RNG state, rehash to get next state
   */
  private rng = 0;

  /**
   * Whether this game is still ongoing
   */
  private active = true;

  /**
   * How many consecutive frames the board has been in a dead state.
   */
  private danger = 0;

  constructor() {
    super();
    this.board = new Board();
  }

  /**
   * Advances the simulate one time step. Handles ball merging.
   */
  public step() {
    this.board.step(this.eventQueue);
    this.eventQueue.drainCollisionEvents((handle1, handle2, started) => {
      if (!this.colliders.has(handle1) || !this.colliders.has(handle2)) return;
      const o1 = this.colliders.get(handle1) as Ball;
      const o2 = this.colliders.get(handle2) as Ball;
      /* Handle collision event. */
      // console.log(started ? 'together' : 'apart', o1, o2);
      if (started && o1.type === o2.type) {
        this.merge(o1, o2);
      }
    });

    if (!this.isAlive()) {
      ++this.danger;
      if (this.danger >= 60) {
        this.active = false;
      }
    } else {
      this.danger = 0;
    }
  }

  /**
   * Steps only if active.
   */
  public stepIfActive() {
    if (this.active) this.step();
  }

  /**
   * Returns the next ball type based on the RNG state.
   * @returns next ball type
   */
  public getNext() {
    const largestAllowed = constrain(this.largestBall - 1, 2, FRUIT_TYPES - 5);
    return Math.abs(this.rng) % (largestAllowed + 1);
  }

  /**
   * Updates the position where the next ball appears.
   * @param nx
   */
  public setNx(nx: number) {
    this.nx = nx;
  }

  /**
   * Places the next ball at the position at the top (y=0).
   * This updates the RNG state.
   * @param x position
   */
  public placeBall(x: number) {
    this.setNx(x);
    this.createBall(x, 0, this.getNext());
    this.rng = hash(this.rng);
  }

  /**
   * Creates a ball at the specified position with specific tier
   * and starts tracking it's collider.
   * @param x position
   * @param y
   * @param ballType tier of ball
   */
  public createBall(x: number, y: number, ballType: number) {
    const newBall = this.board.createBall(x, y, ballType);
    newBall.attachCollider(this.colliders);
    this.largestBall = Math.max(this.largestBall, ballType);
  }

  public injectGarbage(ballType: number) {
    const x = Math.random() * BOARD_WIDTH - BOARD_WIDTH / 2;
    const y = BOARD_HEIGHT / 2;
    const newBall = this.board.createBall(x, y, ballType, false);
  }

  /**
   * Merges two balls.
   * @param ball1
   * @param ball2
   */
  public merge(ball1: Ball, ball2: Ball) {
    if (ball1.type !== ball2.type) {
      throw new Error(
        'Cannot merge balls of different type. ' +
          `Got ${ball1.type} and ${ball2.type}`,
      );
    }
    const { type } = ball1;

    // The higher ball falls into and merges with the lower ball.
    const position =
      ball1.translation().y < ball2.translation().y
        ? ball1.translation()
        : ball2.translation();
    const { x, y } = position;
    ball1.dispose();
    ball2.dispose();

    this.emit('merge', type);

    // apparently two watermelons disappear
    if (type + 1 < FRUIT_TYPES) {
      this.createBall(x, y, type + 1);
    }
  }

  /**
   * TODO: Board should periodically compress the ball list.
   * maybe every 50th addition? how many balls can you fit?
   * @returns all active balls
   */
  public getBalls() {
    return this.board.getBalls().filter((x) => !x.isDisposed());
  }

  /**
   * Does a status check on the board.
   * Current death condition: is when there is a ball
   *  moving upwards or stationary such that its center is above the top (y=0).
   *
   * TODO: a more lenient system such as a ball too high for some k frames
   * @returns whether this board is still alive
   */
  private isAlive(): boolean {
    for (const ball of this.getBalls()) {
      const { x, y } = ball.translation();
      if (y > 0 && ball.linvel().y > 0) return false;
    }
    return true;
  }

  /**
   * Returns whether this board is still active
   * @returns this.active
   */
  public isActive(): boolean {
    return this.active;
  }

  /**
   * Serializes the board. Keeps position, next, and ball data.
   * @returns encoded serialization of the board
   */
  public serialize() {
    const balls = this.getBalls().map((ball) =>
      ball.serialize(BOARD_WIDTH, BOARD_HEIGHT),
    );
    return [this.nx, this.getNext(), balls.join(''), this.danger].join(' ');
  }

  /**
   * Deserializes the string representation of the board.
   * @returns [nx, nextBall, balls]
   */
  public static deserialize(raw: string) {
    const [enx, enext, eballs, edanger] = raw.split(' ');
    const n = eballs.length;
    const balls = new Array(n / 4)
      .fill(0)
      .map((_, i) => eballs.substring(i * 4, i * 4 + 4))
      .map((s) => Ball.deserialize(s, BOARD_WIDTH, BOARD_HEIGHT));
    const nx = +enx;
    const next = +enext;
    const danger = +edanger;
    return [nx, next, balls, danger] as [number, number, typeof balls, number];
  }

  /**
   * Resets the board by disposing of the old one and instantiating a new one.
   */
  public reset() {
    this.board.free();
    this.board = new Board();
    this.colliders.clear();
    this.largestBall = 0;
    this.active = true;
  }

  /**
   * Frees up all WASM allocated objects.
   *
   * This discards the board without creating a new one. Use this only when
   * the entire SuikaBoard is no longer needed, such as player disconnect.
   */
  public free() {
    this.board.free();
    this.eventQueue.free();
  }
}

export default SuikaBoard;
