import { Socket } from 'socket.io-client';
import Board from '../lib/Board';
import { xdti } from '../lib/util';
import { suika } from '@/proto';

/**
 * client-side board that handles update requests from user to
 * the client instance of board and sends updates to server
 */
export class ClientBoard extends Board {
  private socket: Socket | null = null;
  constructor() {
    super();
  }

  /**
   * sets the socket that will also have requested events piped into it
   * @param socket
   */
  public setSocket(socket: Socket | null) {
    this.socket = socket;
  }

  public requestPlacing(x: number) {
    const e = this.createEvent();
    e.eventType = 'placing';
    e.placing = {
      x: xdti(x, this.getWidth()),
    };
    this.pushEvent(e);
    this.socket?.emit('board', suika.Event.encode(e).finish());
  }

  public requestPlace(x: number) {
    const e = this.createEvent();
    e.eventType = 'place';
    e.place = {
      x: xdti(x, this.getWidth()),
    };
    this.pushEvent(e);
    this.socket?.emit('board', suika.Event.encode(e).finish());
  }
}
