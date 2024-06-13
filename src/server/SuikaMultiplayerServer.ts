import WebSocket, { WebSocketServer, AddressInfo } from 'ws';

import SuikaBoard from '@/suika/SuikaBoard';
import Client from '@/server/Client';

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
      // const t_ = performance.now();
      
      let active = 0;
      for (const game of games) {
        game.stepIfActive();
        if (game.isActive()) ++active;
      }
      if (active <= 1 && games.length > 1) {
        // one player alive and at least 2 players
        for (const game of games) game.reset();
      }
      
      const payload = JSON.stringify(games.map((game) => game.serialize()));
      wss.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(payload);
        }
      });
      // visualize server load
      // const t = performance.now() - t_;
      // const TT = t.toFixed(1).padStart(4);
      // const TP = (t/16*100).toFixed(1).padStart(5);
      // const BAR = "=".repeat(Math.min(Math.round(t/16*25), 30)).padEnd(25);
      // console.log(`${TT}ms ${TP}% [${BAR}]`);
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
        const addr = request.socket.remoteAddress;
        const pid = games.length;
        console.log(`new connection from <${addr}> as <#${pid}>`);

        // ws should be OPEN upon connection
        const client = new Client(ws);
        const game = client.startGame();
        games[pid] = game;
        client.setPid(pid);

        game.on('merge', (mergeType) => {
          // send damage to another person
          if (games.length > 1) {
            // make sure another person exists
            const rng = Math.floor(Math.random() * (games.length - 1));
            const target = rng + (rng >= pid ? 1 : 0);
            if (mergeType >= 4) {
              for (let i = 0; i < 3; ++i) {
                games[target].injectGarbage(mergeType - 4);
              }
            }
          }
        });

        ws.on('error', console.error);
        ws.on('close', () => console.log(`disconnect <#${pid}>`));
      });
    });
  }
}

export default SuikaMultiplayerServer;
