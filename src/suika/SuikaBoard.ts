import DynamicEntity, { ColliderHandlerMap } from '@/lib/DynamicEntity';
import Rapier from '@/lib/RapierInstance';
import Board from '@/suika/Board';
import Ball from '@/suika/Ball';
import { FRUIT_TYPES } from '@/constants';

/**
 * Represents one full game. This handles the game logic.
 */
class SuikaBoard {
  private board: Board;
  private colliders: ColliderHandlerMap = new Map<number, DynamicEntity>();
  private eventQueue = new Rapier.EventQueue(true);
  private largestBall = 0;

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
