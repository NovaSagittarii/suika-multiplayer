import StaticEntity from './StaticEntity';

import * as RAPIER from '@dimforge/rapier2d/rapier';
const Rapier = await import('@dimforge/rapier2d');

/**
 * Wall (rectangle)
 */
export default class Wall extends StaticEntity {
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
      .setRestitution(0.5);
    super(world, colliderDesc);
  }
}
