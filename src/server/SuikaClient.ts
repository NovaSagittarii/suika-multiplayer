import Member from './Member';
import Room, { Visibility } from './Room';

/**
 * utility class for the server to keep track of clients
 */
export default class SuikaClient {
  /**
   * the member in the room this client is associated with
   */
  public member: Member | null = null;

  /**
   * current room this client is a part of
   */
  public room: Room | null = null;

  /**
   * client id (socket id for now before auth is added)
   */
  public readonly id: string;

  /**
   * client alias for use in rooms
   */
  public readonly name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  /**
   * Creates a room then updates itself.
   * @returns the room it created
   */
  createRoom(visibility: Visibility) {
    const room = new Room(visibility);
    room.addMember(this.id, this.name);
    this.room = room;
    this.member = room.getMember(this.id)!;
    return room;
  }

  /**
   * Try to join room then update itself.
   * @param room room to attempt joining
   * @returns true if it was successful
   */
  joinRoom(room: Room) {
    if (room.addMember(this.id, this.name)) {
      this.room = room;
      this.member = room.getMember(this.id)!;
      return true;
    }
    return false;
  }

  /**
   * Leaves the room currently in, if in one
   * @returns return if it was successful
   */
  leaveRoom() {
    if (this.room && this.member) {
      this.room.removeMember(this.member.id);
      this.room = this.member = null;
      return true;
    }
    return false;
  }
}
