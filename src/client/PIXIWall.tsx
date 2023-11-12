import * as PIXI from 'pixi.js';
import { Container, Graphics } from '@pixi/react';
import { useCallback, useEffect, useState } from 'react';

import Wall, { WallRenderProps } from '../lib/Wall';

export type PIXIWallProps = {
  props: WallRenderProps;
}
export default function PIXIWall({ props }: PIXIWallProps) {
  const { x, y, hx, hy } = props;
  const draw = useCallback((g: PIXI.Graphics) => {
    g.clear();
    g.beginFill(0x00ff00);
    g.drawRect(x - hx, y - hy, hx * 2, hy * 2);
    g.scale.set(50);
  }, [x, y, hx, hy]);

  return <Graphics draw={draw} />;
}
