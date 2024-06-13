import { BOARD_WIDTH } from '@/constants';
import { decodeRange } from '@/lib/util';
import SuikaBoard from '@/suika/SuikaBoard';
import WebSocket, { WebSocketServer, AddressInfo } from 'ws';

/**
 * TODO: Used in the future for server configuration.
 */
interface SuikaMultiplayerServerConfiguration {}

/**
 * Main class for the entire game server
 */
class SuikaMultiplayerServer {
  private config: SuikaMultiplayerServerConfiguration;

  constructor(config: SuikaMultiplayerServerConfiguration) {
    this.config = config;
  }

  /**
   * Setup the game server. Promise should never resolve -- keeping the server alive.
   * @param wss WebSocketServer to set up listeners on
   * @returns Nothing upon server shutdown, but this shouldn't happen.
   */
  public async run(wss: WebSocketServer): Promise<void> {
    const game = new SuikaBoard();
    for (let i = 0; i < 1000; ++i) {
      if (i % 10 === 0) game.createBall(Math.random(), 0, 0);
      game.step();
    }
    setInterval(() => {
      game.step();
      const payload = game.serialize();
      wss.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(payload);
        }
      });
    }, 16);

    return new Promise((resolve, reject) => {
      const addr = wss.address();
      if (addr instanceof String) {
        console.log(`starting suika server on <${addr}>`);
      } else {
        const { address, port } = addr as AddressInfo;
        console.log(`starting suika server on <[${address}]:${port}>`);
      }

      wss.on('connection', (ws: WebSocket, request) => {
        console.log(`new connection from <${request.socket.remoteAddress}>`);
        ws.on('error', console.error);
        ws.on('message', (data: WebSocket.RawData) => {
          const ex = parseInt(data.toString(), 36);
          const x = decodeRange(ex, -BOARD_WIDTH/2, BOARD_WIDTH/2, 8);
          game.placeBall(x);
        });
      });
    });
  }
}

export default SuikaMultiplayerServer;
