import * as RAPIER from '@dimforge/rapier2d/rapier';
const Rapier = await import('@dimforge/rapier2d');

import DynamicEntity from './DynamicEntity';
import { FRUIT_DIAMETER } from '../constants';

/**
 * Ball physics object
 */
export default class Ball extends DynamicEntity {
  public readonly world: RAPIER.World;
  public readonly type: number;
  public readonly radius: number;

  constructor(world: RAPIER.World, x: number, y: number, type: number) {
    const radius = FRUIT_DIAMETER[type] / 2;
    const rigidBodyDesc = Rapier.RigidBodyDesc.dynamic().setTranslation(x, y);
    const colliderDesc = Rapier.ColliderDesc.ball(radius)
      .setFriction(0.5)
      .setRestitution(0.1)
      .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
      .setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.DEFAULT);
    super(world, rigidBodyDesc, colliderDesc);

    this.world = world;
    this.type = type;
    this.radius = radius;
  }

  public renderProps(): BallRenderProps {
    const { x, y } = this.translation();
    return {
      x,
      y,
      theta: this.rigidBody.rotation(),
      type: this.type,
    };
  }
}

/**
 * properties needed for rendered
 */
export type BallRenderProps = {
  x: number;
  y: number;
  theta: number;
  type: number;
};
