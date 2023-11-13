import * as PIXI from 'pixi.js';
import { Container, Graphics } from '@pixi/react';
import { useCallback, useEffect, useState } from 'react';

import Ball, { BallRenderProps } from '../lib/Ball';

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
      g.setTransform(x*50, y*50, 50, 50, theta, 0, 0, 0, 0);
      g.rotation = theta;
    },
    [x, y, radius],
  );

  return <Graphics draw={draw} />;
}
