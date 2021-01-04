/**
 * TODO: Usage on the server side:
 * import { notify } from './hmr/index';
 * watchFiles(path.join(__dirname, '../dist')) // path can be a directory or file and can also be string[]
 * notify({filename: 'dist/index.js', type: 'serverrestart'});
 */
import {
  createServer,
  IncomingMessage,
  Server,
  ServerResponse
} from 'http';
import { Server as HmrServer } from '../classes/Server.js';
import { join } from 'path';
import {
  fileURLToPath,
  parse 
} from 'url';
import { IFileChangedEvent } from '../types/types';

// TODO: Make these configurable:
const serverPort = 9001;
const websocketPort = 9002;

const hmrServer = new HmrServer({
  port: websocketPort,
  watch: {
    // TODO: Make these configurable:
    path: [
      join(fileURLToPath(import.meta.url), '../../../dist/client'),
      // join(fileURLToPath(import.meta.url), '../../../dist/common'),
      join(fileURLToPath(import.meta.url), '../../../dist/server'),
    ]
  }
});

const server: Server = createServer((req: IncomingMessage, res: ServerResponse) => {
  const {type, filename} = parse(req.url, true).query;

  hmrServer.notifyConnectedClients({
    filename: (typeof filename === 'string' ? filename : filename.toString()) as IFileChangedEvent['filename'],
    type: (typeof type === 'string' ? type : type.toString()) as IFileChangedEvent['type'],
  });

  return res.end('[HMR] Notified all connected clients');
});

server.listen(serverPort, () => {
  console.log(
    '[HMR] Web server listening on http://localhost:' + serverPort + 
    ', websocket server on ws://localhost:' + websocketPort
  );
});
