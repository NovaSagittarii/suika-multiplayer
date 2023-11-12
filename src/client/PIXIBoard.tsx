import { Container, Graphics } from '@pixi/react';
import { useCallback, useEffect, useState } from 'react';
import * as PIXI from 'pixi.js';

import Board from '../lib/Board';
import Ball from '../lib/Ball';
import PIXIWall from './PIXIWall';
import PIXIBall from './PIXIBall';

export type PIXIBoardProps = { board: Board };
export default function PIXIBoard({ board }: PIXIBoardProps) {
  return (
    <Container
      scale={[1, -1]}
      x={board.getWidth() * 50}
      y={board.getHeight() * 10}
    >
      {board.getWalls().map((wall, index) => (
        <PIXIWall wall={wall} key={index} />
      ))}
      {[...board.getBalls().values()].map((ball, index) => (
        <PIXIBall ball={ball as Ball} key={index} />
      ))}
    </Container>
  );
}
