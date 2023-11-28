import React, { useEffect, useRef, useState } from 'react';

import Board from '../lib/Board';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../constants';
import { ClientBoard } from './io';
import { suika } from '@/proto';
import { SioProvider } from './SioProvider';
import RoomListing from './pages/RoomListing';
import RoomDisplay from './pages/RoomDisplay';
import BoardDisplay from './pages/BoardDisplay';

function App() {
  // useEffect(() => {
  //   const socket = io({ transports: ['websocket'] });
  //   socket.on('connect', () => {
  //     board.setSocket(socket);
  //     // TODO: use the id from the server from the game room (fix spaghetti)
  //     board.initialize(0, BOARD_WIDTH, BOARD_HEIGHT, socket.id.charCodeAt(0));
  //     setTicks(ticks - 1);
  //   });

  //   socket.emit('message', 'hello');
  //   socket.on('message', (data) => console.info('[sockets]', data));

  //   socket.on('board', (data) => {
  //     if (suika.Event.verify(data) === null) {
  //       const event = suika.Event.decode(new Uint8Array(data));
  //       if (!otherBoard.isInitialized()) {
  //         console.log('initialized otherboard with id', event.target);
  //         otherBoard.initialize(0, BOARD_WIDTH, BOARD_HEIGHT, event.target);
  //         setTicks(ticks - 1);
  //       }
  //       if (event.target == otherBoard.getId()) {
  //         otherBoard.acceptEvent(event);
  //         setTicks(otherBoard.getTicks());
  //       }
  //     }
  //   });

  //   return () => {
  //     board.setSocket(null);
  //     socket.disconnect();
  //   };
  // }, []);

  return (
    <SioProvider>
      <div className='App bg-slate-800'>
        <RoomListing />
        <RoomDisplay />
        <BoardDisplay />
      </div>
    </SioProvider>
  );
}

export default App;
