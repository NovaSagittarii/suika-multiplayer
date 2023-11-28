import { Server as HttpServer } from 'http';
import { Server as SioServer, Socket } from 'socket.io';
import * as proto from '@/proto';
import SuikaClient from '@/server/SuikaClient';
import Room from '@/server/Room';

export function createIOServer(server: HttpServer) {
  const io = new SioServer(server);

  const sockets = new Map<string, SuikaClient>();
  const rooms = new Map<number, Room>();

  // properly abstract this?
  function broadcastToRoom(room: Room, event: proto.room.Event) {
    for (const [socketId, _member] of room.getMembers()) {
      io.to(socketId as string).emit(
        'room',
        proto.room.Event.encode(event).finish(),
      );
    }
  }
  function broadcastBoardEventToRoom(room: Room, event: proto.suika.Event) {
    for (const [socketId, _member] of room.getMembers()) {
      io.to(socketId as string).emit(
        'board',
        proto.suika.Event.encode(event).finish(),
      );
    }
  }

  function sendRoomDetails(socket: Socket, room: Room) {
    const response = proto.room.Event.create();
    response.target = room.id;
    response.newRoom = {
      room: room.getDetails(),
      memberId: sockets.get(socket.id)?.member?.id,
    };
    socket.emit('room', proto.room.Event.encode(response).finish());
  }

  const ns2 = io.of('/ns2');
  ns2.on('connection', (socket) => {
    socket.emit('message', `Welcome to ns2 ${socket.id}`);
  });

  io.on('connection', (socket) => {
    console.log(`A user connected ${socket.id}`);
    const suikaClient = new SuikaClient(socket.id, 'test');
    sockets.set(socket.id, suikaClient);

    socket.on('room', (data) => {
      if (proto.room.Event.verify(data) === null) {
        const event = proto.room.Event.decode(new Uint8Array(data));
        const room = rooms.get(event.target);
        console.log(socket.id, `[room:${event.eventType}]`, event);
        switch (event.eventType) {
          case 'create': {
            console.log(suikaClient);
            if (suikaClient.room === null) {
              const newRoom = suikaClient.createRoom(
                Room.visibilityFromProto(event.create?.visibility),
              );
              rooms.set(newRoom.id, newRoom);
              sendRoomDetails(socket, newRoom);
            }
            break;
          }
          case 'join': {
            if (room && suikaClient.joinRoom(room)) {
              // broadcast
              event.join = {
                member: suikaClient.member!,
              };
              sendRoomDetails(socket, room);
              // note: currently join does not work properly (overloaded with registering identity client)
              // broadcastToRoom(room, event);
            }
            break;
          }
          case 'leave': {
            const { room } = suikaClient;
            if (room && event.target === room.id && suikaClient.leaveRoom()) {
              event.leave = {
                memberId: suikaClient.member!.id,
              };
              if (room.empty()) {
                rooms.delete(room.id);
                // remove room reference when no one's left
              } else {
                // broadcastToRoom(room, event);
              }
            }
            break;
          }
          case 'list': {
            const listing = [];
            for (const room of rooms.values()) listing.push(room.getListing());
            const response = proto.room.Event.create();
            response.list = {
              rooms: listing,
            };
            socket.emit('room', proto.room.Event.encode(response).finish());
            // console.log('send list', response);
            break;
          }
          case 'start':
          case 'updateConfig': {
            if (!suikaClient.room) break;
            event.target = suikaClient.room.id;
            const room = rooms.get(event.target);
            console.log('[startevent:room]', room);
            // only the host is allowed to do this
            if (room && suikaClient.member?.id === room.getHost()) {
              if (event.start) {
                event.start = {
                  players: [...room.getMembers()]
                    .map(([_id, member]) => member)
                    .filter((member) => member.active),
                };
                // set the members playing
              }
              console.log('[startevent]', event.start);
              room.processEvent(event);
              broadcastToRoom(room, event);
              // broadcast
            }
            break;
          }
          case 'updateMember': {
            const room = rooms.get(event.target);
            if (room) {
              event.updateMember!.newMember!.id = suikaClient.member?.id;
              room.processEvent(event); // update server's room isntance
              broadcastToRoom(room, event); // broadcast to clients
            }
            break;
          }
        }
      }
    });

    // TODO: *remove* the spaghetti code the 1v1 gamering
    // TODO: server to host instances for validation
    socket.on('board', (data) => {
      const issues = proto.suika.Event.verify(data);
      const { room } = suikaClient;
      if (issues === null && suikaClient.member?.id && room) {
        const event = proto.suika.Event.decode(new Uint8Array(data));
        event.target = suikaClient.member?.id; // make sure target is correct
        broadcastBoardEventToRoom(room, event);
      }
    });

    socket.on('disconnect', () => {
      console.log(`user disconnected ${socket.id}`);
    });
  });
}
