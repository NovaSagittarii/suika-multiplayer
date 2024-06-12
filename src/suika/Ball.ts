import RAPIER from '@dimforge/rapier2d-compat/rapier';

import Rapier from '@/lib/RapierInstance';

import DynamicEntity from '@/lib/DynamicEntity';
import { FRUIT_RADIUS } from '@/constants';

/**
 * Ball physics object
 */
export default class Ball extends DynamicEntity {
  public readonly world: RAPIER.World;
  public readonly type: number;
  public readonly radius: number;

  constructor(world: RAPIER.World, x: number, y: number, type: number) {
    const radius = FRUIT_RADIUS[type];
    const rigidBodyDesc = Rapier.RigidBodyDesc.dynamic().setTranslation(x, y);
    const colliderDesc = Rapier.ColliderDesc.ball(radius)
      .setFriction(0.5)
      .setRestitution(0.1)
      .setActiveEvents(Rapier.ActiveEvents.COLLISION_EVENTS)
      .setActiveCollisionTypes(Rapier.ActiveCollisionTypes.DEFAULT);
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
 * properties when rendered
 */
export type BallRenderProps = {
  x: number;
  y: number;
  theta: number;
  type: number;
};