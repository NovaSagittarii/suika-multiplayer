import { Container, Graphics } from '@pixi/react';
import { useCallback, useEffect, useState } from 'react';
import * as PIXI from 'pixi.js';

import Board from '../lib/Board';
import Ball, { BallRenderProps } from '../lib/Ball';
import PIXIWall from './PIXIWall';
import PIXIBall from './PIXIBall';
import { WallRenderProps } from '../lib/Wall';

export type PIXIBoardProps = {
  width: number,
  height: number,
  balls: BallRenderProps[],
  walls: WallRenderProps[],
 };
export default function PIXIBoard({ width, height, balls, walls }: PIXIBoardProps) {
  return (
    <Container
      scale={[1, -1]}
      x={width * 50}
      y={height * 10}
    >
      {walls.map((wall, index) => (
        <PIXIWall props={wall} key={index} />
      ))}
      {balls.map((ball, index) => (
        <PIXIBall props={ball} key={index} />
      ))}
    </Container>
  );
}
