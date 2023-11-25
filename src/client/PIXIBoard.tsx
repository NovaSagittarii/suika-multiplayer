import React from 'react';
import { Container } from '@pixi/react';

import { BallRenderProps } from '../lib/Ball';
import PIXIWall from './PIXIWall';
import PIXIBall from './PIXIBall';
import { WallRenderProps } from '../lib/Wall';
import { constrain } from '../lib/util';

export type PIXIBoardProps = {
  x: number;
  y: number;

  /**
   * current tick; used to convince react to redraw stuff
   */
  ticks: number;

  width: number;
  height: number;
  balls: BallRenderProps[];
  walls: WallRenderProps[];

  /**
   * controller state -- where the next ball will be placed
   */
  nextX: number;
  nextRadius: number;
};
export default function PIXIBoard({
  x,
  y,
  width,
  height,
  balls,
  walls,
  nextX,
  nextRadius,
}: PIXIBoardProps) {
  return (
    <Container scale={20} x={x} y={y}>
      <Container scale={[1, -1]} x={width} y={4}>
        <PIXIWall
          props={{ x: 0, y: -height / 2, hx: width / 2, hy: height / 2 }}
          color={0x008888}
        />
        {walls.map((wall, index) => (
          <PIXIWall props={wall} key={index} />
        ))}
        {balls.map((ball, index) => (
          <PIXIBall props={ball} key={index} />
        ))}
        <PIXIBall
          props={{
            x: constrain(
              nextX,
              -width / 2 + nextRadius,
              width / 2 - nextRadius,
            ),
            y: nextRadius,
            theta: 0,
            radius: nextRadius,
          }}
        />
      </Container>
    </Container>
  );
}
