import * as PIXI from 'pixi.js';
import { Container, Graphics } from '@pixi/react';
import { useCallback, useEffect, useState } from 'react';

import Wall, { WallRenderProps } from '../lib/Wall';

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
      g.drawRect(x - hx, y - hy, hx * 2, hy * 2);
    },
    [x, y, hx, hy, color],
  );

  return <Graphics draw={draw} />;
}
