import DynamicEntity, { ColliderHandlerMap } from '@/lib/DynamicEntity';
import Rapier from '@/lib/RapierInstance';
import Board from '@/suika/Board';
import Ball from '@/suika/Ball';
import { BOARD_HEIGHT, BOARD_WIDTH, FRUIT_TYPES } from '@/constants';
import { constrain, encodeRange, hash } from '@/lib/util';

/**
 * Represents one full game. This handles the game logic.
 */
class SuikaBoard {
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

  constructor() {
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
   * Serializes the board. Keeps position, next, and ball data.
   * @returns encoded serialization of the board
   */
  public serialize() {
    const balls = this.getBalls().map((ball) =>
      ball.serialize(BOARD_WIDTH, BOARD_HEIGHT),
    );
    return [this.nx, this.getNext(), balls.join('')].join(' ');
  }

  /**
   * Deserializes the string representation of the board.
   * @returns [nx, nextBall, balls]
   */
  public static deserialize(raw: string) {
    const [enx, enext, eballs] = raw.split(' ');
    const n = eballs.length;
    const balls = new Array(n / 4)
      .fill(0)
      .map((_, i) => eballs.substring(i * 4, i * 4 + 4))
      .map((s) => Ball.deserialize(s, BOARD_WIDTH, BOARD_HEIGHT));
    const nx = +enx;
    const next = +enext;
    return [nx, next, balls] as [number, number, typeof balls];
  }

  /**
   * Resets the board by disposing of the old one and instantiating a new one.
   */
  private resetBoard() {
    this.board.free();
    this.board = new Board();
    this.colliders.clear();
    this.largestBall = 0;
  }
}

export default SuikaBoard;
