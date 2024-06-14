import { expect, test } from 'vitest';
import WebSocket, { WebSocketServer } from 'ws';
import SuikaMultiplayerServer from './SuikaMultiplayerServer';
import { shuffled } from '@/lib/util';
import EventEmitter from 'events';

class WebSocketServerMock extends WebSocketServer {
  constructor() {
    super({ noServer: true });
  }
  address() {
    return {
      address: 'fake_address',
      family: 'IPv4',
      port: 8080,
    };
  }
}

class WebSocketMock extends EventEmitter {
  public readyState: typeof WebSocket.prototype.readyState = WebSocket.OPEN;
  public send(data: string) {}
  public close() {
    this.readyState = WebSocket.CLOSED;
    this.emit('close');
  }
}

/**
 * Sets up a mock WebSocketServer and SuikaMultiplayerServer to use,
 * then cleans up afterwards.
 * @param cb callback to use the wss/server
 */
function withServer(
  cb: (wss: WebSocketServer, server: SuikaMultiplayerServer) => void,
) {
  const wss = new WebSocketServerMock();
  const server = new SuikaMultiplayerServer();
  server.run(wss);
  cb(wss, server);
  server.shutdown();
}

test('Server startup and shutdown', () => {
  withServer(() => {});
  // idk how to detect interval stoppage ??
});

test('Many joins and leaves -- fuzzing for race condition', () => {
  withServer((wss, server) => {
    const wsList = new Array(100).fill(0).map(() => new WebSocketMock());
    for (const ws of shuffled(wsList)) {
      wss.emit('connection', ws, { socket: { remoteAddress: 'fake_addr' } });
    }
    for (const ws of shuffled(wsList)) {
      ws.close();
    }
  });
});

// test('Garbage cannot be sent to self -- 1 player', () => {});
// test('Garbage cannot be sent to self -- 2 players', () => {});
// test('Garbage cannot be sent to self -- 6 players', () => {});
// test('Garbage cannot be sent to dead players', () => {});

// something about afk check
// test('Disconnect player after 25 frames of inactivity', () => {});
// maybe reset after 25 frames global inactivity ??
