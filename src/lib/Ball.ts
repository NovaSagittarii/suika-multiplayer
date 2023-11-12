import DynamicEntity from './DynamicEntity';

import * as RAPIER from '@dimforge/rapier2d/rapier';
const Rapier = await import('@dimforge/rapier2d');

const typeToRadius = [0.2, 0.25, 0.3, 0.35, 0.4, 0.5, 0.6, 0.7];

/**
 * Ball physics object
 */
export default class Ball extends DynamicEntity {
  public readonly world: RAPIER.World;
  public readonly type: number;
  public readonly radius: number;

  constructor(world: RAPIER.World, x: number, y: number, type: number) {
    const radius = typeToRadius[type];
    const rigidBodyDesc = Rapier.RigidBodyDesc.dynamic().setTranslation(x, y);
    const colliderDesc = Rapier.ColliderDesc.ball(radius)
      .setFriction(0.5)
      .setRestitution(0.0);
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
      radius: this.radius,
    };
  }
}

/**
 * properties needed for rendered
 */
export type BallRenderProps = {
  x: number;
  y: number;
  radius: number;
};
