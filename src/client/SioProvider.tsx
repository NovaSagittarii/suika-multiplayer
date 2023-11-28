import {
  createContext,
  useReducer,
  PropsWithChildren,
  type Dispatch,
  useEffect,
} from 'react';
import { io } from 'socket.io-client';
import SioState from './SioState';
import Board from '@/lib/Board';
import { Action as SioAction } from './SioAction';
import { ClientBoard } from './io';
import * as proto from '@/proto';
import Room from '@/server/Room';
import { BOARD_HEIGHT, BOARD_WIDTH } from '@/constants';

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
 * Keeps an instance of the clientBoard, a normal Board but doesn't respond
 * to server events (reduce perceived latency), instead generates its own events
 * and pushes them to the server.
 */
let clientBoard = new ClientBoard();

export function SioProvider({ children }: PropsWithChildren<{}>) {
  const [state, dispatch] = useReducer(SioReducer, new SioState());

  // useEffect(() => {
  //   console.log('[sio update]', state);
  // }, [state]);

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
      // note: if you need to modify sioState (`state` in this scope), pass an action to the dispatch function
      // instead since this state is constant and will never change. i don't know why but it's something with react.
      const event = proto.room.Event.decode(new Uint8Array(data));
      // console.log('[room] recieved', event);
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
          dispatch({
            type: 'handleStart',
            event,
          });
          break;
      }
    });

    socket.on('board', (data: ArrayBuffer) => {
      const dataIssues = proto.suika.Event.verify(data);
      if (dataIssues)
        throw new Error(`[board] invalid event proto: ${dataIssues}`);
      const event = proto.suika.Event.decode(new Uint8Array(data));
      if (!event.target)
        throw new Error(
          `[board] event is missing target, got <${event.target}>`,
        );
      dispatch({
        type: 'handleBoard',
        event,
      });
    });

    return () => {
      clientBoard.setSocket(null);
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
  if (sio.socket) {
    // depends on sio.socket
    // event to be sent to server at the end regarding room state
    let event: proto.room.IEvent | null = proto.room.Event.create();
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
      case 'handleStart':
        event = null; // disable emit since this is handling an event; TODO: maybe send to server for "ready to start?"
        {
          const event = action.event;
          if (!event.start) throw new Error('event is not of type start');
          if (!event.start.players)
            throw new Error('start event is missing players field');
          if (!sio.memberId)
            throw new Error(
              'missing memberId on state, maybe never got it from server?',
            );
          console.log('[handleStart] setting up the game!', event.start);
          boards.clear();
          clientBoard = new ClientBoard();
          clientBoard.setSocket(sio.socket);
          clientBoard.initialize(0, BOARD_WIDTH, BOARD_HEIGHT, sio.memberId);
          for (const player of event.start.players) {
            if (player.id && player.name) {
              const board = new Board();
              boards.set(player.id, board);
              // TODO: read room configuration (new options need to be added) and set it here
              board.initialize(0, BOARD_WIDTH, BOARD_HEIGHT, player.id);
            }
          }
          sio = { ...sio, boards, clientBoard };
          break;
        }
      case 'handleBoard': {
        event = null;
        // this does not emit an event, just handles the board event
        const targetBoard = sio.boards?.get(action.event.target);
        if (targetBoard === undefined)
          throw new Error(
            '[board] client does not have target board allocated',
          );
        if (!targetBoard.isInitialized())
          throw new Error('[board] target board exists but is not initialized');
        targetBoard.acceptEvent(action.event);
        break;
      }
      // if you're coming here because of an error, make sure the previous case block has a break/return
      // i've made that mistake several times now... :moyai:
      default:
        throw Error(`unknown action <${action.type}>`);
    }
    if (event) {
      // console.log('send', event);
      if (!sio.socket)
        throw new Error(
          'sio state socket is not initialized, it should be if it is receiving events',
        );
      sio.socket.emit('room', proto.room.Event.encode(event).finish());
    }
  }
  return sio;
}
