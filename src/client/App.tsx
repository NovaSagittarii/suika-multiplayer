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
import { BOARD_HEIGHT, BOARD_WIDTH, FRUIT_RADIUS } from '../constants';
import { ClientBoard } from './io';

const board = new ClientBoard();
board.initialize(0, BOARD_WIDTH, BOARD_HEIGHT);
const ball = board.placeBall(0, 0);

function App() {
  const requestRef = useRef<number>(0);
  const [balls, setBalls] = useState<BallRenderProps[]>([]);
  const [mousePosition, setMousePosition] = useState([0, 0]);

  const animate = (time: number) => {
    requestRef.current = requestAnimationFrame(animate);
    setBalls(board.getBalls());
    board.requestPlacing(mousePosition[0]);
    
    // manual ticking
    let wasTicked = board.tick();
    if (!wasTicked) {
      board.step(); // step the physics engine for yourself if events were processed instead
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [mousePosition]); // Make sure the effect runs only once

  useEffect(() => {
    const socket = io({ transports: ['websocket'] });
    board.setSocket(socket);

    socket.emit('message', 'hello');
    socket.on('message', (data) => console.info('[sockets]', data));

    return () => {
      board.setSocket(null);
      socket.disconnect();
    };
  }, []);

  return (
    <div className='App bg-slate-800'>
      <div className='flex align-middle w-full h-[100vh]'>
        <Stage
          className='m-auto w-full h-full object-contain block opacity-50 hover:opacity-100 transition-opacity'
          onMouseMove={(e) => {
            const { clientX, clientY } = e;
            const x = clientX - e.currentTarget.offsetLeft;
            const y = clientY - e.currentTarget.offsetTop;
            // console.log(clientX, e.currentTarget.offsetLeft, x);
            setMousePosition([(x + 80) / 20 - board.getWidth(), y / 20]);
          }}
          onMouseDown={() => {
            board.requestPlace(mousePosition[0]);
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
              nextX={mousePosition[0]}
              nextRadius={FRUIT_RADIUS[board.getNextBall()]}
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
              nextX={board.getInputX()}
              nextRadius={FRUIT_RADIUS[board.getNextBall()]}
            />
          )}
        </Stage>
      </div>
    </div>
  );
}

export default App;
