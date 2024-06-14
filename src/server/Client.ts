import WebSocket from 'ws';

import { BOARD_WIDTH } from '@/constants';
import { decodeRange } from '@/lib/util';
import SuikaBoard from '@/suika/SuikaBoard';

/**
 * Represents one client. Handles websocket interactions.
 * Takes the websocket associated with this client in the constructor,
 * then sets up the input processing.
 */
class Client {
  private ws: WebSocket;
  // TODO: maybe client should extend SuikaBoard instead?
  public readonly game: SuikaBoard = new SuikaBoard();
  private pid: number = -1;

  constructor(ws: WebSocket) {
    if (ws.readyState !== WebSocket.OPEN) {
      throw new Error('Websocket must be open!');
    }
    this.ws = ws;

    // attach inbound data processing eventlistener
    ws.on('message', (data: WebSocket.RawData) => {
      if (!this.game.isActive()) return; // dead game
      const str = data.toString();
      const ex = parseInt(str.substring(1), 36);
      const x = decodeRange(ex, -BOARD_WIDTH / 2, BOARD_WIDTH / 2, 8);
      if (str[0] === '?') {
        // update nx
        this.game.setNx(x);
      } else if (str[0] === '!') {
        // place instead
        this.game.placeBall(x);
      }
    });
  }

  /**
   * Initializes a new SuikaBoard and returns it. Store the reference somewhere
   * to be used to create the game state data.
   * @returns this.game
   */
  public startGame() {
    this.game.reset();
    return this.game;
  }

  /**
   * Sets the client's player ID. Broadcasts to websocket if the value changes.
   */
  public setPid(pid: number) {
    if (this.pid !== pid) {
      this.ws.send('!' + pid);
    }
    this.pid = pid;
  }

  public getPid() {
    return this.pid;
  }

  /**
   * Send data to client via websocket only if connected.
   */
  private send(data: Parameters<typeof WebSocket.prototype.send>[0]) {
    // TODO: do checks on this.ws.bufferedAmount
    if (this.isConnected()) {
      this.ws.send(data);
    }
  }

  /**
   * Cleans up allocated data.
   */
  private free() {
    this.game.free();
  }

  /**
   * Used to determine when to cull a client. This assumes clients are
   * already connected the moment the server acknowledges them.
   * @returns Whether the websocket is still open
   */
  public isConnected() {
    return this.ws.readyState === WebSocket.OPEN;
  }
}

export default Client;
