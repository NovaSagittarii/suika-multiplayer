import WebSocket, { WebSocketServer, AddressInfo } from 'ws';

import SuikaBoard from '@/suika/SuikaBoard';
import Client from '@/server/Client';
import { enumerate } from '@/lib/util';

/**
 * TODO: Used in the future for server configuration.
 */
interface SuikaMultiplayerServerConfiguration {
  /**
   * Whether debug messages are printed (console.log)
   */
  debug?: boolean;
}

/**
 * Main class for the entire game server
 */
class SuikaMultiplayerServer {
  private config: SuikaMultiplayerServerConfiguration;
  
  /**
   * Called when shutdown is called.
   * Should call the resolve of the run promise.
   */
  private shutdownCallback: () => void = () => {};

  constructor(config: SuikaMultiplayerServerConfiguration = {}) {
    this.config = config;
  }

  /**
   * Setup the game server. Promise should never resolve -- keeping the server alive.
   * @param wss WebSocketServer to set up listeners on
   * @returns Nothing upon server shutdown.
   */
  public async run(wss: WebSocketServer): Promise<void> {
    const clients: Client[] = [];

    // Run update loop
    const updateInterval = setInterval(() => {
      // const t_ = performance.now();

      let active = 0;
      // remove disconnected clients as you enumerate them (so no race)
      for (const [i, client] of enumerate(clients)) {
        const { game } = client;
        if (client.isConnected()) {
          game.stepIfActive();
          if (game.isActive()) ++active;
        } else {
          // swap with last (minimize reassignment bandwidth cost)
          // since the last element gets removed, need to check bounds
          while (i < clients.length && !clients[i].isConnected()) {
            const prevClient = clients[i];
            clients[i] = clients[clients.length - 1];
            clients[i].setPid(i);
            clients.pop();
            // clean up yourself
            prevClient.game.free();
          }
        }
      }

      if (active <= 1 && clients.length > 1) {
        // one player alive and at least 2 players
        for (const { game } of clients) game.reset();
      }

      const payload = JSON.stringify(
        clients.map((client) => client.game.serialize()),
      );
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
      this.shutdownCallback = () => {
        clearInterval(updateInterval);
        for (const client of clients) client.game.free();
        resolve();
      };

      const addr = wss.address();
      if (addr instanceof String) {
        this.log(`starting suika server on <${addr}>`);
      } else {
        const { address, port } = addr as AddressInfo;
        this.log(`starting suika server on <[${address}]:${port}>`);
      }

      wss.on('connection', (ws: WebSocket, request) => {
        // Create new game instance and notify client about their player ID
        const addr = request.socket.remoteAddress;
        const pid = clients.length;
        this.log(`new connection from <${addr}> as <#${pid}>`);

        // ws should be OPEN upon connection
        const client = new Client(ws);
        const game = client.startGame();
        clients[pid] = client;
        client.setPid(pid);

        game.on('merge', (mergeType) => {
          // send damage to another person
          if (clients.length > 1) {
            // make sure another person exists
            const rng = Math.floor(Math.random() * (clients.length - 1));
            const target = rng + (rng >= client.getPid() ? 1 : 0);
            if (mergeType >= 4) {
              const count = 3 + (mergeType - 4) * 3;
              for (let i = 0; i < count; ++i) {
                clients[target].game.injectGarbage(mergeType - 4);
              }
            }
          }
        });

        ws.on('error', console.error);
        ws.on('close', () => {
          this.log(`disconnect <#${pid}>`);
        });
      });
    });
  }

  /**
   * Starts shutdown process.
   */
  public shutdown() {
    this.shutdownCallback();
  }

  /** 
   * Log something (does a config.debug check first)
   */
  private log(...x: any) {
    if (this.config.debug) {
      console.log(...x);
    }
  }
}

export default SuikaMultiplayerServer;
