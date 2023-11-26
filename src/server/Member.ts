import { room } from "@/proto";

/**
 * Member of a room, associated with a client
 * 
 * Currently, this is very similar to the .proto file, but might change
 * in the future. (?)
 */
export default class Member {
  public readonly id: number;
  public readonly name: string;
  public active: boolean;

  constructor (id: number, name: string, active: boolean = true) {
    this.id = id;
    this.name = name;
    this.active = active;
  }

  /**
   * sets up protobuf object for wire transfer
   * @returns protobuf form of member instance
   */
  public toProto() {
    const member = room.Member.create();
    member.active = this.active;
    member.id = this.id;
    member.name = this.name;
    return member;
  }
}