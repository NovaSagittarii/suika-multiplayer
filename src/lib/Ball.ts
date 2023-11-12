import DynamicEntity from './DynamicEntity';

import * as RAPIER from '@dimforge/rapier2d/rapier';
const Rapier = await import('@dimforge/rapier2d');

const typeToRadius = [0.05, 0.1, 0.2, 0.3, 0.4, 0.5];

/**
 * Ball physics object
 */
export default class Ball extends DynamicEntity {
  public readonly world: RAPIER.World;
  public readonly x: number;
  public readonly y: number;
  public readonly type: number;

  constructor(world: RAPIER.World, x: number, y: number, type: number) {
    const rigidBodyDesc = Rapier.RigidBodyDesc.dynamic().setTranslation(x, y);
    const colliderDesc = Rapier.ColliderDesc.ball(typeToRadius[type])
      .setFriction(0.5)
      .setRestitution(0.0);
    super(world, rigidBodyDesc, colliderDesc);

    this.world = world;
    this.x = x;
    this.y = y;
    this.type = type;
  }
}
