const express = require('express');
const http = require('http');

const { createServer: createViteServer } = require('vite');
import { createIOServer } from './io';

const port = process.env.APP_PORT || 3010;

async function createMainServer() {
  const app = express();
  const server = http.createServer(app);

  createIOServer(server);

  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: {
        server,
      },
    },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.use(express.static('static'));

  server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
}

createMainServer();
