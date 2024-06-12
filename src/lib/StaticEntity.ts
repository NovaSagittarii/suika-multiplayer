import RAPIER from '@dimforge/rapier2d-compat/rapier';

import DisposableEntity from '@/lib/DisposableEntity';

// export { type ColliderHandlerMap } from './DynamicEntity';

/**
 * wrapper class for collider-only objects in rapier (cannot be moved)
 */
export default class StaticEntity extends DisposableEntity {
  protected colliderDesc: RAPIER.ColliderDesc;
  protected collider: RAPIER.Collider;
  protected world: RAPIER.World;

  /**
   * list of collider maps this Collider is a part of
   */
  // private elementOf: ColliderHandlerMap[] = [];

  constructor(world: RAPIER.World, colliderDesc: RAPIER.ColliderDesc) {
    super();
    this.world = world;
    this.colliderDesc = colliderDesc;
    this.collider = world.createCollider(colliderDesc);
  }

  dispose() {
    if (super.dispose()) return false;
    // for (const colliderHandlerMap of this.elementOf) {
    //   colliderHandlerMap.delete(this.collider.handle);
    // }

    // this collider is never attached to a rigid body
    this.world.removeCollider(this.collider, false);
    return true;
  }

  /**
   * Attaches object to a lookup table when dealing with collider handles,
   * automatically cleans up after itself when disposed of.
   * @param dictionary what `ColliderHandlerMap` map to attach this to
   */
  // attachCollider(colliderHandlerMap: ColliderHandlerMap) {
  //   colliderHandlerMap.set(this.collider.handle, this);
  //   this.elementOf.push(colliderHandlerMap);
  // }
}
