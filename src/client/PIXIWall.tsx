import * as PIXI from 'pixi.js';
import { Container, Graphics } from '@pixi/react';
import { useCallback, useEffect, useState } from 'react';

import Wall from '../lib/Wall';

export type PIXIWallProps = { wall: Wall };
export default function PIXIWall({ wall }: PIXIWallProps) {
  const draw = useCallback((g: PIXI.Graphics) => {
    g.clear();
    g.beginFill(0x00ff00);
    g.drawRect(wall.x - wall.hx, wall.y - wall.hy, wall.hx * 2, wall.hy * 2);
    g.scale.set(50);
  }, []);

  return <Graphics draw={draw} />;
}
