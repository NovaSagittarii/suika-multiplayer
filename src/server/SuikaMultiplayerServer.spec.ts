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

test('Server startup and shutdown', () => {
  const wss = new WebSocketServerMock();
  const server = new SuikaMultiplayerServer();
  server.run(wss);
  server.shutdown();
  // idk how to detect interval stoppage ??
});

test('Many joins and leaves -- fuzzing for race condition', () => {
  const wss = new WebSocketServerMock();
  const server = new SuikaMultiplayerServer();
  server.run(wss);

  const wsList = new Array(100).fill(0).map(() => new WebSocketMock());
  for (const ws of shuffled(wsList)) {
    wss.emit('connection', ws, { socket: { remoteAddress: 'fake_addr' } });
  }
  for (const ws of shuffled(wsList)) {
    ws.close();
  }

  server.shutdown();
});
