import { room } from '@/proto';
import Room from '@/server/Room';
import { Socket } from 'socket.io-client';
import Board from 'src/lib/Board';

export default class SioState {
  /**
   * room listing of public rooms
   */
  public roomListing?: room.IRoomListing[];

  /**
   * current room this client is a member of
   */
  public room?: Room | null;

  /**
   * member id within the current room
   */
  public memberId?: number;

  public name?: string;

  /**
   * member id -> board mapping; used with memberId to find client's board
   */
  public boards?: Map<number, Board>;

  public socket?: Socket | null;

  constructor() {
    this.roomListing = [];
    this.room = null;
    this.memberId = 0;
    this.name = '';
    this.boards = new Map();
    this.socket = null;
  }
}
