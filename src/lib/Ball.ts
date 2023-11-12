import ColliderEntity from './ColliderEntity';

import * as RAPIER from '@dimforge/rapier2d/rapier';
const Rapier = await import('@dimforge/rapier2d');

/**
 * Ball physics object
 */
export default class Ball extends ColliderEntity {
  constructor(world: RAPIER.World, x: number, y: number, radius: number) {
    const rigidBodyDesc = Rapier.RigidBodyDesc.dynamic().setTranslation(x, y);
    const colliderDesc = Rapier.ColliderDesc.ball(radius)
      .setFriction(0.5)
      .setRestitution(0.0);
    super(world, rigidBodyDesc, colliderDesc);
  }
}
