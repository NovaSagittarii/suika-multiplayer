import RAPIER from '@dimforge/rapier2d-compat/rapier';

import Rapier from '@/lib/RapierInstance';

class Board {
  private world: RAPIER.World;
  constructor() {
    this.world = new Rapier.World(new Rapier.Vector2(0, -9.81));

    // setup walls
  }

  /**
   * Frees up the board physics world.
   */
  public free() {
    this.world.free();
  }
}

export default Board;
