import { Server as HttpServer } from 'http';
import { Server as SioServer } from 'socket.io';
import { suika } from '@/proto';

export function createIOServer(server: HttpServer) {
  const io = new SioServer(server);

  const ns2 = io.of('/ns2');
  ns2.on('connection', (socket) => {
    socket.emit('message', `Welcome to ns2 ${socket.id}`);
  });

  io.on('connection', (socket) => {
    console.log(`A user connected ${socket.id}`);

    socket.on('message', (msg) => {
      console.log('server got a message ', msg);

      socket.emit('message', 'yoyo');
    });

    // TODO: *remove* the spaghetti code the 1v1 gamering
    socket.on('board', (data) => {
      const issues = suika.Event.verify(data);
      if (issues === null) {
        socket.broadcast.emit('board', data);
      }
    });

    socket.on('disconnect', () => {
      console.log(`user disconnected ${socket.id}`);
    });
  });
}
