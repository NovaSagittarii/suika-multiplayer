import * as PIXI from 'pixi.js';
import { Graphics } from '@pixi/react';
import React, { useCallback } from 'react';

import { WallRenderProps } from '../lib/Wall';

export type PIXIWallProps = {
  props: WallRenderProps;
  color?: number;
};
export default function PIXIWall({ props, color = 0x00ff00 }: PIXIWallProps) {
  const { x, y, hx, hy } = props;
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.beginFill(color);
      g.drawRect(-hx, -hy, hx * 2, hy * 2);
    },
    [hx, hy, color],
  );

  return <Graphics x={x} y={y} draw={draw} />;
}
