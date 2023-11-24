import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Stage, Container, Sprite, Text } from '@pixi/react';

import { suika } from '../lib/proto';
import Board from '../lib/Board';
import PIXIBoard from './PIXIBoard';
import Ball, { BallRenderProps } from '../lib/Ball';
import Wall from '../lib/Wall';
import PIXIWall from './PIXIWall';
import PIXIBall from './PIXIBall';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../constants';

const board = new Board();
board.initialize(0, BOARD_WIDTH, BOARD_HEIGHT);
const ball = board.placeBall(0, 0);

function App() {
  const requestRef = useRef<number>(0);
  const [balls, setBalls] = useState<BallRenderProps[]>([]);
  const [mousePosition, setMousePosition] = useState([0, 0]);

  const animate = (time: number) => {
    // The 'state' will always be the initial value here
    requestRef.current = requestAnimationFrame(animate);
    setBalls(board.getBalls());
    board.step();
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []); // Make sure the effect runs only once

  useEffect(() => {
    const socket = io({ transports: ['websocket'] });

    socket.emit('message', 'hello');
    socket.on('message', (data) => console.info('[sockets]', data));

    return () => {
      socket.disconnect();
    };
  }, []);

  const stepBoard = useCallback(() => {
    board.step();
    console.log(ball?.translation());
  }, [board]);

  return (
    <div className='App'>
      <div className='card'>
        <button onClick={stepBoard}>step</button>
      </div>
      <p className='read-the-docs'>
        Click on the Vite and React logos to learn more
      </p>
      {/* <PIXIStage /> */}
      <Stage
        onMouseMove={(e) => {
          const { clientX, clientY } = e;
          const x = clientX - e.currentTarget.offsetLeft;
          const y = clientY - e.currentTarget.offsetTop;
          // console.log(clientX, e.currentTarget.offsetLeft, x);
          setMousePosition([x / 20, y / 20]);
        }}
        onMouseDown={() => {
          board.place(mousePosition[0] - board.getWidth());
        }}
      >
        {board && (
          <PIXIBoard
            x={-80}
            y={0}
            width={board.getWidth()}
            height={board.getHeight()}
            balls={balls}
            walls={board.getWalls()}
            nextX={mousePosition[0] - board.getWidth()}
            nextRadius={0.5}
          />
        )}
        {board && (
          <PIXIBoard
            x={320}
            y={0}
            width={board.getWidth()}
            height={board.getHeight()}
            balls={balls}
            walls={board.getWalls()}
            nextX={mousePosition[0] - board.getWidth()}
            nextRadius={0.5}
          />
        )}
      </Stage>
    </div>
  );
}

export default App;
