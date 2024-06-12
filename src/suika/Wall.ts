import RAPIER from '@dimforge/rapier2d-compat/rapier';

import Rapier from '@/lib/RapierInstance';
import StaticEntity from '@/lib/StaticEntity';

/**
 * Wall (rectangle)
 */
export default class Wall extends StaticEntity {
  public readonly x: number;
  public readonly y: number;
  public readonly hx: number;
  public readonly hy: number;

  /**
   *
   * @param world the world to create the wall (static rectangle collider) in
   * @param x x-position
   * @param y y-position
   * @param hx The half-width of the rectangle along its local x axis
   * @param hy The half-width of the rectangle along its local y axis
   */
  constructor(
    world: RAPIER.World,
    x: number,
    y: number,
    hx: number,
    hy: number,
  ) {
    const colliderDesc = Rapier.ColliderDesc.cuboid(hx, hy)
      .setTranslation(x, y)
      .setFriction(0.0)
      .setRestitution(0.1);
    super(world, colliderDesc);
    this.x = x;
    this.y = y;
    this.hx = hx;
    this.hy = hy;
  }

  public renderProps(): WallRenderProps {
    return {
      x: this.x,
      y: this.y,
      hx: this.hx,
      hy: this.hy,
    };
  }
}

/**
 * properties needed for rendering wall
 */
export type WallRenderProps = {
  x: number;
  y: number;
  hx: number;
  hy: number;
};
