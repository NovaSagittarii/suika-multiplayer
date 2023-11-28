// This file looks a lot like protobuf oneof :thinking:

import { Visibility } from '@/server/Room';
import { Socket } from 'socket.io-client';
import SioState from './SioState';
import * as proto from '@/proto';

/**
 * Unioned type that compasses all actions that can be dispatched to the
 * socketio client manager.
 */
export type Action = action.Sio | action.Room | action.Suika;

// Note: (type:string) is explicit so typescript can give good suggestions
export namespace action {
  interface TargetsMemberId {
    memberId: string;
  }

  export type Sio = sio.Set;

  export namespace sio {
    interface Set {
      type: 'set';
      stateUpdates: SioState;
    }
  }

  /**
   * Wrapper class for socketio client actions regarding the room
   */
  export type Room =
    | room.Create
    | room.Join
    | room.Leave
    | room.List
    | room.Start
    | room.Config
    | room.Member
    | room.HandleStart
    | room.HandleBoard;

  /**
   * Socketio client actions regarding the room
   */
  export namespace room {
    interface TargetsRoomId {
      roomId: number;
    }

    export interface Create {
      type: 'create';
      visibility: Visibility;
    }

    export interface Join extends TargetsRoomId {
      type: 'join';
    }

    export interface Leave {
      type: 'leave';
    }

    export interface List {
      type: 'list';
    }

    export interface Start {
      type: 'start';
    }

    export interface Config {
      type: 'config';
    }

    export interface Member extends TargetsMemberId {
      type: 'member';
    }

    /**
     * handler to call to set up and initialize boards
     */
    export interface HandleStart {
      type: 'handleStart';
      event: proto.room.Event;
    }

    /**
     * handler to call to process board update events
     */
    export interface HandleBoard {
      type: 'handleBoard';
      event: proto.suika.Event;
    }
  }

  /**
   * Wrapper class for socketio client actions regarding the game
   */
  export type Suika = suika.Place | suika.Placing;

  /**
   * Socketio client actions regarding the game
   */
  export namespace suika {
    interface HasLocation {
      location: number;
    }
    export interface Place extends HasLocation {
      type: 'place';
    }

    export interface Placing extends HasLocation {
      type: 'placing';
    }
  }
}
