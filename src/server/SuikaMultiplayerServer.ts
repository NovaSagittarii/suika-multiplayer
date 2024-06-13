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
    const games: SuikaBoard[] = [];

    // Run update loop
    setInterval(() => {
      for (const game of games) game.step();
      const payload = JSON.stringify(games.map((game) => game.serialize()));
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
        // Create new game instance and notify client about their player ID
        const pid = games.length;
        ws.send(`!${pid}`);
        const game = new SuikaBoard();
        games.push(game);

        const addr = request.socket.remoteAddress;
        console.log(`new connection from <${addr}> as <#${pid}>`);

        ws.on('error', console.error);

        // Process placement data
        ws.on('message', (data: WebSocket.RawData) => {
          const str = data.toString();
          const ex = parseInt(str.substring(1), 36);
          const x = decodeRange(ex, -BOARD_WIDTH / 2, BOARD_WIDTH / 2, 8);
          if (str[0] === '?') {
            // update nx
            game.setNx(x);
          } else if (str[0] === '!') {
            // place instead
            game.placeBall(x);
          }
        });
        ws.on('close', () => console.log(`disconnect <#${pid}>`));
      });
    });
  }
}

export default SuikaMultiplayerServer;
