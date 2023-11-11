import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import PIXIStage from './Stage';

const RAPIER = await import('@dimforge/rapier2d');

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const socket = io({ transports: ['websocket'] });

    socket.emit('message', 'hello');
    socket.on('message', (data) => console.info('[sockets]', data));

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className='App'>
      <div className='card'>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className='read-the-docs'>
        Click on the Vite and React logos to learn more
      </p>
      <PIXIStage />
    </div>
  );
}

export default App;
