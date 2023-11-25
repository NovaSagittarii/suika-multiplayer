import React from 'react';
import * as PIXI from 'pixi.js';
import { Container, Graphics, Sprite } from '@pixi/react';
import { useCallback } from 'react';

import { BallRenderProps } from '../lib/Ball';
import { FRUIT_RADIUS } from '../constants';
import { FRUIT_DATA } from './assets';

export type PIXIBallProps = {
  props: BallRenderProps;
};
export default function PIXIBall({ props }: PIXIBallProps) {
  const { x, y, theta, type } = props;
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.beginFill(0xff0000, 0.1);
      g.drawCircle(0, 0, FRUIT_RADIUS[type]);
    },
    [type],
  );

  return (
    <Container x={x} y={y} rotation={theta} scale={[1, -1]}>
      <Graphics draw={draw} />
      <Container scale={FRUIT_DATA[type].radius * 4 * FRUIT_RADIUS[type]}>
        <Sprite
          image={FRUIT_DATA[type].path}
          anchor={FRUIT_DATA[type].anchor}
          width={1}
          height={1}
        />
      </Container>
    </Container>
  );
}
