import { Server as HttpServer } from 'http';
import { Server as SioServer } from 'socket.io';
import * as proto from '@/proto';
import SuikaClient from '@/server/SuikaClient';
import Room from '@/server/Room';

export function createIOServer(server: HttpServer) {
  const io = new SioServer(server);

  const sockets = new Map<string, SuikaClient>();
  const rooms = new Map<number, Room>();

  function broadcastToRoom(room: Room, data: any) {
    for (const [socketId, _member] of room.getMembers()) {
      io.to(socketId as string).emit(data);
    }
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
        const event = proto.room.Event.decode(data);
        const room = rooms.get(event.target);
        switch (event.eventType) {
          case 'create': {
            const newRoom = suikaClient.createRoom(Room.visibilityFromProto(event.create?.visibility!));
            rooms.set(newRoom.id, newRoom);
            break;
          }
          case 'join': {
            if (room && suikaClient.joinRoom(room)) {
              // broadcast
              event.join = {
                'member': suikaClient.member!,
              };
              broadcastToRoom(room, event);
            }
            break;
          }
          case 'leave': {
            const { room } = suikaClient;
            if (room && event.target === room.id && suikaClient.leaveRoom()) {
              event.leave = {
                'memberId': suikaClient.member!.id,
              };
              if (room.empty()) {
                rooms.delete(room.id);
                // remove room reference when no one's left
              } else {
                broadcastToRoom(room, event);
              }
            }
            break;
          }
          case 'list': {
            const listing = [];
            for (const room of rooms.values()) listing.push(room.getListing());
            const response = proto.room.Event.create();
            response.eventType = 'list';
            response.list = {
              'rooms': listing,
            };
            socket.emit('room', proto.room.Event.encode(response).finish());
            break;
          }
          case 'start':
          case 'updateConfig': {
            const room = rooms.get(event.target);
            // only the host is allowed to do this
            if (room && suikaClient.member?.id !== room.getHost()) {
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
    })

    // TODO: *remove* the spaghetti code the 1v1 gamering
    // TODO: server to host instances for validation
    socket.on('board', (data) => {
      const issues = proto.suika.Event.verify(data);
      if (issues === null) {
        socket.broadcast.emit('board', data);
      }
    });

    socket.on('disconnect', () => {
      console.log(`user disconnected ${socket.id}`);
    });
  });
}
