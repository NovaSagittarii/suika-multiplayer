import RAPIER from '@dimforge/rapier2d-compat/rapier';

import DisposableEntity from '@/lib/DisposableEntity';


/**
 * Maps collider handlers (number) to the entity they're a part of
 */
export type ColliderHandlerMap = Map<number, DynamicEntity>;

/**
 * wrapper class for rigidbody + collider objects in rapier
 */
export default class DynamicEntity extends DisposableEntity {
  protected rigidBodyDesc: RAPIER.RigidBodyDesc;
  protected rigidBody: RAPIER.RigidBody;
  protected colliderDesc: RAPIER.ColliderDesc;
  protected collider: RAPIER.Collider;
  protected world: RAPIER.World;

  /**
   * list of collider maps this Collider is a part of
   */
  private elementOf: ColliderHandlerMap[] = [];

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
    for (const colliderHandlerMap of this.elementOf) {
      colliderHandlerMap.delete(this.collider.handle);
    }
    this.world.removeRigidBody(this.rigidBody);
    return true;
  }

  /**
   * Attaches object to a lookup table when dealing with collider handles,
   * automatically cleans up after itself when disposed of.
   * @param dictionary what `ColliderHandlerMap` map to attach this to
   */
  attachCollider(colliderHandlerMap: ColliderHandlerMap) {
    colliderHandlerMap.set(this.collider.handle, this);
    this.elementOf.push(colliderHandlerMap);
  }

  translation() {
    return this.rigidBody.translation();
  }

  linvel() {
    return this.rigidBody.linvel();
  }
}
