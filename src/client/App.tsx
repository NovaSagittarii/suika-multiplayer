import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Stage } from '@pixi/react';

import Board from '../lib/Board';
import PIXIBoard from './PIXIBoard';
import { BOARD_HEIGHT, BOARD_WIDTH, FRUIT_RADIUS } from '../constants';
import { ClientBoard } from './io';
import { suika } from '../lib/proto';

const board = new ClientBoard();
const otherBoard = new Board();

function App() {
  const requestRef = useRef<number>(0);
  const [ticks, setTicks] = useState<number>(0);
  const [mousePosition, setMousePosition] = useState([0, 0]);

  const animate = (time: number) => {
    requestRef.current = requestAnimationFrame(animate);
    if (board.isInitialized() && otherBoard.isInitialized()) {
      setTicks(board.getTicks());
      board.requestPlacing(mousePosition[0]);

      // manual ticking
      let wasTicked = board.tick();
      if (!wasTicked) {
        board.step(); // step the physics engine for yourself if events were processed instead
      }

      otherBoard.tick();
      otherBoard.tick(); // tick to catch up the physics engine
      otherBoard.tick(); // tick to catch up with events if you were lagging
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [mousePosition]); // Make sure the effect runs only once

  useEffect(() => {
    const socket = io({ transports: ['websocket'] });
    socket.on('connect', () => {
      board.setSocket(socket);
      // TODO: use the id from the server from the game room (fix spaghetti)
      board.initialize(0, BOARD_WIDTH, BOARD_HEIGHT, socket.id.charCodeAt(0));
      setTicks(ticks - 1);
    });

    socket.emit('message', 'hello');
    socket.on('message', (data) => console.info('[sockets]', data));

    socket.on('board', (data) => {
      if (suika.event.game.GameEvent.verify(data) === null) {
        const event = suika.event.game.GameEvent.decode(new Uint8Array(data));
        if (!otherBoard.isInitialized()) {
          console.log('initialized otherboard with id', event.target);
          otherBoard.initialize(0, BOARD_WIDTH, BOARD_HEIGHT, event.target);
          setTicks(ticks - 1);
        }
        if (event.target == otherBoard.getId()) {
          otherBoard.acceptEvent(event);
          setTicks(otherBoard.getTicks());
        }
      }
    });

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
              ticks={ticks}
              width={board.getWidth()}
              height={board.getHeight()}
              balls={board.getBalls()}
              walls={board.getWalls()}
              nextX={mousePosition[0]}
              nextRadius={FRUIT_RADIUS[board.getNextBall()]}
              debugText={board.getTicks() + ''}
            />
          )}
          {otherBoard.isInitialized() && (
            <PIXIBoard
              x={320}
              y={0}
              ticks={ticks}
              width={otherBoard.getWidth()}
              height={otherBoard.getHeight()}
              balls={otherBoard.getBalls()}
              walls={otherBoard.getWalls()}
              nextX={otherBoard.getInputX()}
              nextRadius={FRUIT_RADIUS[otherBoard.getNextBall()]}
              debugText={otherBoard.getTicks() + ''}
            />
          )}
        </Stage>
      </div>
    </div>
  );
}

export default App;
