import { Server as HttpServer } from 'http';
import { Server as SioServer } from 'socket.io';

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

    socket.on('disconnect', () => {
      console.log(`user disconnected ${socket.id}`);
    });
  });
}
