import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Stage, Container, Sprite, Text } from '@pixi/react';

import { suika } from '../lib/proto';
import Board from '../lib/Board';
import PIXIBoard from './PIXIBoard';
import Ball, { BallRenderProps } from '../lib/Ball';

const board = new Board();
board.initialize(0, 5, 5);
const ball = board.placeBall(0, 0);

function App() {
  const requestRef = useRef<number>(0);
  const [balls, setBalls] = useState<BallRenderProps[]>([]);

  const animate = (time: number) => {
    // The 'state' will always be the initial value here
    requestRef.current = requestAnimationFrame(animate);
    setBalls(board.getBalls());
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
      <Stage>
        {board && 
          <PIXIBoard 
            width={board.getWidth()} 
            height={board.getHeight()}
            balls={balls}
            walls={board.getWalls()}
          />
        }
      </Stage>
    </div>
  );
}

export default App;
