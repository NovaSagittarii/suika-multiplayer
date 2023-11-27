import { room } from '@/proto';

import Member from './Member';

/**
 * possibly a string (clientId) on server or number (memberId) on client
 */
type clientId = string | number;

export const enum Visibility {
  PUBLIC = 1,
  PRIVATE = 2,
}

export default class Room {
  /**
   * counter used to assign unique roomIds
   */
  private static roomCounter: number = 1;

  public readonly id: number;

  /**
   * clientId of the host of the room, -1 if not set,
   * but this should not be accessed if it is an empty room
   */
  private host: clientId = -1;

  /**
   * counter used to assign unique memberIds
   * (ids are null-checked by truthiness so make sure its nonzero)
   */
  private memberCounter: number = 1;

  /**
   * socketId/clientId to member mapping
   */
  private members: Map<clientId, Member> = new Map();

  /**
   * configuration of the room
   */
  private config: room.Config = room.Config.create();

  /**
   * creates an empty room with the a given visibility
   * @param visibility
   */
  constructor(visibility: Visibility = Visibility.PUBLIC) {
    this.id = Room.roomCounter++;
    this.config.visibility = Room.visibilityToProto(visibility);
  }

  public static visibilityToProto(visibility: Visibility) {
    return visibility === Visibility.PUBLIC
      ? room.Visibility.VISIBILITY_PUBLIC
      : room.Visibility.VISIBILITY_PRIVATE;
  }
  public static visibilityFromProto(
    visibility: room.Visibility | null | undefined,
  ) {
    if (!visibility) return Visibility.PUBLIC;
    return visibility === room.Visibility.VISIBILITY_PUBLIC
      ? Visibility.PUBLIC
      : Visibility.PRIVATE;
  }

  /**
   * Creates a room.RoomListing object associated with the room
   * to be sent to the clients for display.
   * @returns RoomListing for the room
   */
  public getListing() {
    const listing = room.RoomListing.create();
    listing.capacity = 2;
    listing.id = this.id;
    listing.name = this.config.name;
    listing.size = this.members.size;
    return listing;
  }

  /**
   * Creates a room.Room object associated with the room to be
   * send to clients for initialization of their instance.
   * @return Room for the room
   */
  public getDetails() {
    const proto = room.Room.create();
    proto.config = this.config;
    proto.host = this.getMember(this.host)?.id!;
    proto.id = this.id;
    proto.members = [];
    for (const member of this.members.values()) {
      proto.members.push(member.toProto());
    }
    return proto;
  }

  /**
   * Processes a room.Event, does partial validation, but assumes the event is
   * true unless it is very wrong.
   * @param event Event to the processed and applied to the room instance
   */
  public processEvent(event: room.Event) {
    switch (event.eventType) {
      case 'join': {
        const { id, name, active } = event.join?.member!;
        this.addMember(id!, name!);
        this.setActive(id!, true);
        break;
      }
      case 'leave':
        this.removeMember(event.join?.member?.id || null);
        break;
      case 'updateConfig': {
        const { name, visibility } = event.updateConfig?.newConfig!;
        this.config.name = name || this.config.name;
        this.config.visibility = visibility || this.config.visibility;
        break;
      }
      case 'updateMember': {
        const { active, id } = event.updateMember?.newMember!;
        this.setActive(id!, active!);
        break;
      }
      case 'start':
        break;
    }
  }

  /**
   * Adds the specified clientId and sets their memberId.
   * When adding the member, they automatically become the host.
   *
   * Fails if the clientId is already mapped in the room.
   * @param id clientId of member to add
   * @param name member alias
   * @returns true if add was successful
   */
  public addMember(id: clientId, name: string) {
    console.log(this.members, id, name, 'adding');
    if (this.members.has(id)) return false;
    const canJoin = true;
    const setHost = this.empty();
    this.members.set(id, new Member(this.memberCounter++, name, canJoin));
    if (setHost) {
      this.host = this.members.get(id)?.id!;
    }
    return true;
  }

  /**
   * Removes the specified member (leave/kick).
   * @param id clientId of member to remove
   * @returns true if removal was successful
   */
  public removeMember(id: clientId | null) {
    if (id) return this.members.delete(id);
    return false;
  }

  /**
   * Queries the client-member mapping.
   * @param id clientId of member to query
   * @returns memberId of the specified client or null if it does not exist
   */
  public getMember(id: clientId) {
    return this.members.get(id) || null;
  }

  /**
   * Updates the member's active status
   * @param id clientId of member to set active
   * @param newActive new active state to set
   */
  public setActive(id: clientId, newActive: boolean = true) {
    const member = this.getMember(id);
    if (member) {
      member.active = newActive;
    }
    return this;
  }

  /**
   * Returns how many members are in the room
   * (used to determine if the room is dead or not)
   * @returns true if there are no members
   */
  public empty() {
    return this.members.size === 0;
  }

  /**
   *
   * @returns returns the host member id
   */
  public getHost() {
    return this.host;
  }

  /**
   *
   * @returns memberId-member key value pairs
   */
  public getMembers() {
    return this.members.entries();
  }
}
