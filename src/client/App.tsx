import { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Stage, Container, Sprite, Text } from '@pixi/react';

import { suika } from '../lib/proto';
import Board from '../lib/Board';
import PIXIBoard from './PIXIBoard';
import Ball from '../lib/Ball';

const rboard = new Board();
rboard.initialize(0, 5, 5);
const rball = rboard.placeBall(0, 0);

function App() {
  const [board, setBoard] = useState<Board | null>(null);
  const [ball, setBall] = useState<Ball | null>(null);

  useEffect(() => {
    setInterval(() => {
      setBoard(rboard);
      setBall(rball);
    }, 50);
  }, []);

  useEffect(() => {
    const socket = io({ transports: ['websocket'] });

    socket.emit('message', 'hello');
    socket.on('message', (data) => console.info('[sockets]', data));

    return () => {
      socket.disconnect();
    };
  }, []);

  const stepBoard = useCallback(() => {
    console.log('hello?', board);
    board?.step();
    setBoard(board);
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
      <Stage>{board && <PIXIBoard board={board} />}</Stage>
    </div>
  );
}

export default App;
