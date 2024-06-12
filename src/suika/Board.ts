import RAPIER from '@dimforge/rapier2d-compat/rapier';

import { BOARD_GRAVITY, BOARD_HEIGHT, BOARD_WIDTH } from '@/constants';
import Rapier from '@/lib/RapierInstance';
import Ball from '@/suika/Ball';
import Wall from '@/suika/Wall';

interface BoardConfiguration {
  width?: number;
  height?: number;
}

/**
 * Represents the board (container) and balls, handles the physics.
 */
class Board {
  private world: RAPIER.World;
  private balls: Ball[] = [];
  public readonly walls: Wall[];
  constructor({
    width = BOARD_WIDTH,
    height = BOARD_HEIGHT,
  }: BoardConfiguration = {}) {
    this.world = new Rapier.World(new Rapier.Vector2(0, -BOARD_GRAVITY));

    // setup walls
    this.walls = [
      new Wall(this.world, -width / 2 - 1, 0, 1, height * 2),
      new Wall(this.world, width / 2 + 1, 0, 1, height * 2),
      new Wall(this.world, 0, -height - 1, width, 1),
    ];
  }

  /**
   * Frees up the board physics world.
   */
  public free() {
    this.world.free();
  }

  /**
   * Creates a ball of a specific type at a fixed location.
   * @param x position of ball
   * @param y position of ball
   * @param ballType type of ball (indexes into the radius list)
   * @returns ball that was just created
   */
  public createBall(x: number, y: number, ballType: number) {
    const ball = new Ball(this.world, x, y, ballType);
    this.balls.push(ball);
    return ball;
  }

  /**
   * Advance the board simulation by one time step.
   */
  public step() {
    this.world.step();
  }
}

export default Board;