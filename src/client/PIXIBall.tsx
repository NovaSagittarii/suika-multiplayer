import * as PIXI from 'pixi.js';
import { Container, Graphics } from '@pixi/react';
import { useCallback, useEffect, useState } from 'react';

import Ball, { BallRenderProps } from '../lib/Ball';

export type PIXIBallProps = {
  props: BallRenderProps;
}
export default function PIXIBall({ props }: PIXIBallProps) {
  const { x, y, radius } = props;
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.beginFill(0xff0000);
      g.drawCircle(x, y, radius);
      g.scale.set(50);
    },
    [x, y, radius],
  );

  return <Graphics draw={draw} />;
}
