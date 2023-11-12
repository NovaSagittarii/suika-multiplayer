import DisposableEntity from './DisposableEntity';

import * as RAPIER from '@dimforge/rapier2d/rapier';
const Rapier = await import('@dimforge/rapier2d');

export default class ColliderEntity extends DisposableEntity {
  protected rigidBodyDesc: RAPIER.RigidBodyDesc;
  protected rigidBody: RAPIER.RigidBody;
  protected colliderDesc: RAPIER.ColliderDesc;
  protected collider: RAPIER.Collider;
  protected world: RAPIER.World;

  /**
   * list of collider maps this Collider is a part of
   */
  private elementOf: Record<number, ColliderEntity>[] = [];

  constructor(
    world: RAPIER.World,
    rigidBodyDesc: RAPIER.RigidBodyDesc,
    colliderDesc: RAPIER.ColliderDesc,
  ) {
    super();
    this.world = world;
    this.rigidBodyDesc = rigidBodyDesc;
    this.rigidBody = world.createRigidBody(rigidBodyDesc);
    this.colliderDesc = colliderDesc;
    this.collider = world.createCollider(colliderDesc, this.rigidBody);
  }

  dispose() {
    if (super.dispose()) return false;
    for (const dictionary of this.elementOf)
      delete dictionary[this.collider.handle];
    this.world.removeRigidBody(this.rigidBody);
    return true;
  }

  /**
   * Attaches object to a lookup table when dealing with collider handles,
   * automatically cleans up after itself when disposed of.
   * @param dictionary what `Record<number, ColliderEntity>` map to attach this to
   */
  attachCollider(dictionary: Record<number, ColliderEntity>) {
    dictionary[this.collider.handle] = this;
    this.elementOf.push(dictionary);
  }
}
