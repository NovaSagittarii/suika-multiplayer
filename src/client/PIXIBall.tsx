import React from 'react';
import * as PIXI from 'pixi.js';
import { Graphics } from '@pixi/react';
import { useCallback } from 'react';

import { BallRenderProps } from '../lib/Ball';

export type PIXIBallProps = {
  props: BallRenderProps;
};
export default function PIXIBall({ props }: PIXIBallProps) {
  const { x, y, theta, radius } = props;
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.beginFill(0xff0000);
      g.drawCircle(0, 0, radius);
    },
    [radius],
  );

  return <Graphics x={x} y={y} rotation={theta} draw={draw} />;
}
