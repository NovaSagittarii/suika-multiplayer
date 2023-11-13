import { Container, Graphics } from '@pixi/react';
import { useCallback, useEffect, useState } from 'react';
import * as PIXI from 'pixi.js';

import Board from '../lib/Board';
import Ball, { BallRenderProps } from '../lib/Ball';
import PIXIWall from './PIXIWall';
import PIXIBall from './PIXIBall';
import { WallRenderProps } from '../lib/Wall';
import { constrain } from '../lib/util';

export type PIXIBoardProps = {
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
  width,
  height,
  balls,
  walls,
  nextX,
  nextRadius,
}: PIXIBoardProps) {
  return (
    <Container scale={[1, -1]} x={width * 50} y={height * 50}>
      {walls.map((wall, index) => (
        <PIXIWall props={wall} key={index} />
      ))}
      {balls.map((ball, index) => (
        <PIXIBall props={ball} key={index} />
      ))}
      <PIXIBall
        props={{
          x: constrain(nextX, -width / 2 + nextRadius, width / 2 - nextRadius),
          y: 0.5,
          theta: 0,
          radius: nextRadius,
        }}
      />
    </Container>
  );
}
