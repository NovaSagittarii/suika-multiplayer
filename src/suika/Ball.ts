import RAPIER from '@dimforge/rapier2d-compat/rapier';

import Rapier from '@/lib/RapierInstance';

import DynamicEntity from '@/lib/DynamicEntity';
import { FRUIT_RADIUS } from '@/constants';
import { decodeRange, encodeRange } from '@/lib/util';

/**
 * Ball physics object
 *
 * Takes an optional radius with custom type (such as unclearable balls)
 */
export default class Ball extends DynamicEntity {
  public readonly world: RAPIER.World;
  public readonly type: number;
  public readonly radius: number;

  /**
   * Whether this ball can merge or not. If false, this is garbage.
   */
  public readonly active: boolean;

  constructor(
    world: RAPIER.World,
    x: number,
    y: number,
    type: number,
    active: boolean = true,
  ) {
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
    this.active = active;
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

  /**
   * Serialize the ball position and type.
   * @param BOARD_WIDTH
   * @param BOARD_HEIGHT
   * @returns length 4 base36 string representation of the ball
   */
  public serialize(BOARD_WIDTH: number, BOARD_HEIGHT: number): string {
    // basic byte cramming without arraybuffer
    const { x, y } = this.translation();
    const { type, active } = this;
    const ex = encodeRange(x, -BOARD_WIDTH / 2, BOARD_WIDTH / 2, 7);
    const ey = encodeRange(y, -BOARD_HEIGHT, BOARD_HEIGHT / 8, 8);
    // type is [0, 13] so it fits in 4 bytes
    const enc = (ex << 13) | (ey << 5) | (+active << 4) | type;
    return enc.toString(36).padStart(4, '0'); // 2^20 <= 36^4
  }

  /**
   * Deserializes serialized data representing a ball
   * @param raw length 4 base36 string to decode
   * @param BOARD_WIDTH
   * @param BOARD_HEIGHT
   * @returns [x, y, type, active] as a 4-tuple
   */
  public static deserialize(
    raw: string,
    BOARD_WIDTH: number,
    BOARD_HEIGHT: number,
  ): [number, number, number, boolean] {
    const enc = parseInt(raw, 36);
    const ex = (enc >> 13) & 0xff;
    const ey = (enc >> 5) & 0xff;
    const ea = !!((enc >> 4) & 0x1);
    const et = enc & 0xf;
    const x = decodeRange(ex, -BOARD_WIDTH / 2, BOARD_WIDTH / 2, 7);
    const y = decodeRange(ey, -BOARD_HEIGHT, BOARD_HEIGHT / 8, 8);
    return [x, y, et, ea];
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
