import {
  createContext,
  useReducer,
  PropsWithChildren,
  type Dispatch,
  useEffect,
} from 'react';
import { io } from 'socket.io-client';
import SioState from './SioState';
import Board from 'src/lib/Board';
import { Action as SioAction } from './SioAction';
import { ClientBoard } from './io';
import * as proto from '@/proto';
import Room from '@/server/Room';

/**
 * context for the client state (regarding its connection to the server)
 */
export const SioContext = createContext<SioState | null>(null);
export const SioDispatchContext = createContext<Dispatch<SioAction> | null>(
  null,
);

/**
 * A global map for memberId to board since boards have their own physics engine
 * instance and it seems kinda cringe to recreate it repeatedly. so these are
 * pretty volatile objects, poorly suited for react's immutable states.
 *
 * There might be a better way of handling this though?
 */
const boards = new Map<number, Board>();

/**
 * reference to client board
 */
const board = new ClientBoard();

export function SioProvider({ children }: PropsWithChildren<{}>) {
  const [state, dispatch] = useReducer(SioReducer, new SioState());

  useEffect(() => {
    console.log('[sio update]', state);
  }, [state]);

  function updateState(changes: SioState) {
    dispatch({
      type: 'set',
      stateUpdates: { ...changes },
    });
  }

  useEffect(() => {
    const socket = io({ transports: ['websocket'] });

    socket.emit('message', 'hello');
    socket.on('message', (data) => console.info('[sockets]', data));

    let roomInst: Room | null = null;

    updateState({ socket, room: roomInst });

    // socket event listeners
    socket.on('room', (data: ArrayBuffer) => {
      const event = proto.room.Event.decode(new Uint8Array(data));
      console.log('recieved', event);
      switch (event.eventType) {
        case 'newRoom': {
          // room settings arrived
          const roomData = event.newRoom?.room!;
          const room = (roomInst = new Room());
          if (!roomData.members)
            throw new Error('Expected property members on roomData');
          if (!event.newRoom?.memberId)
            throw new Error('Expected property memberId on newRoom');
          // make sure the host is added first
          roomData.members.sort(
            (a, b) => +(b.id === roomData.host) - +(a.id === roomData.host),
          );
          // populate room
          for (const member of roomData.members) {
            if (member.id && member.name) {
              room.addMember(member.id, member.name);
            }
          }
          updateState({ room: roomInst, memberId: event.newRoom?.memberId });
          console.log('joined the room!', roomInst);
          break;
        }
        case 'list':
          if (event.list?.rooms) {
            updateState({ roomListing: [...event.list?.rooms] });
          }
          console.log('got rooms', state);
          break;
        case 'join':
          if (!state.name) {
            updateState({
              memberId: event.join?.member?.id!,
              name: event.join?.member?.name!,
            });
          }
          break;
        case 'leave':
          break;
        case 'updateConfig':
          break;
        case 'start':
          console.log('hey set up the game');
          break;
      }
    });

    return () => {
      board.setSocket(null);
      socket.disconnect();
    };
  }, []);

  return (
    <SioContext.Provider value={state}>
      <SioDispatchContext.Provider value={dispatch}>
        {children}
      </SioDispatchContext.Provider>
    </SioContext.Provider>
  );
}

function SioReducer(sio: SioState, action: SioAction) {
  // does not need sio.socket
  if (action.type === 'set') {
    return { ...sio, ...action.stateUpdates };
  }
  console.log(sio);
  if (sio.socket) {
    // depends on sio.socket
    // event to be sent to server at the end regarding room state
    const event: proto.room.IEvent | null = proto.room.Event.create();
    switch (action.type) {
      case 'list': {
        event.list = {
          rooms: [],
        };
        break;
      }
      case 'create': {
        event.create = {
          visibility: proto.room.Visibility.VISIBILITY_PUBLIC,
          // TODO: set visibility
        };
        break;
      }
      case 'join': {
        event.target = action.roomId;
        event.join = {
          member: {},
        };
        break;
      }
      case 'start': {
        event.start = {
          players: [],
        };
        break;
      }
      default:
        throw Error(`unknown action <${action.type}>`);
    }
    if (event) {
      console.log('send', event);
      sio.socket.emit('room', proto.room.Event.encode(event).finish());
    }
  }
  return sio;
}
