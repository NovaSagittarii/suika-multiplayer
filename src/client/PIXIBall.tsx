import * as PIXI from 'pixi.js';
import { Container, Graphics } from '@pixi/react';
import { useCallback, useEffect, useState } from 'react';

import Ball from '../lib/Ball';

export type PIXIBallProps = { ball: Ball };
export default function PIXIBall({ ball }: PIXIBallProps) {
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.beginFill(0xff0000);
      g.drawCircle(ball.translation().x, ball.translation().y, ball.radius);
      g.scale.set(50);
    },
    [ball.translation().x, ball.translation().y],
  );

  return <Graphics draw={draw} />;
}
