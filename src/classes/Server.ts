import WebSocket from 'ws';
import { IFileChangedEvent } from "../types/types";
import { IncomingMessage } from 'http';
import { watch } from 'fs';

interface IConstructorOptions {
  hostname: 'localhost' | string;
  port: number;
  watch: {
    ignoredFileExtensions?: string[];
    path: string | string[];
  }
}

export class Server {
  _connectedSockets: {[id: number]: WebSocket} = {};
  _ignoredFileExtensions: string[] = [];
  _lastChangedFile: {filename?: string, timestamp?: number} = {};
  _server: WebSocket.Server;

  constructor(options: IConstructorOptions) {
    if (!options.port || !options.hostname) {
      throw new Error(
        `The Server constructor requires port (received ${options.port}) and hostname (received ${options.hostname})`
      );
    }

    this._ignoredFileExtensions = options.watch.ignoredFileExtensions;

    this._server = new WebSocket.Server({
      port: options.port,
    });

    this._server.on('listening', () => {
      console.log(`[HMR] Websocket server listening on ws://${options.hostname}:${this._server.options.port}`);
    });

    this.handleFileChange = this.handleFileChange.bind(this);

    this.registerConnectedClients();
    this.watchFiles(options.watch.path);
  }

  deregisterClientOnDisconnect(socket: WebSocket, socketId: number) {
    socket.on('close', (code: number, reason: string) => {
      delete this._connectedSockets[socketId];
    });
  }

  handleIncomingMessages(socket: WebSocket) {
    socket.on('message', (data: WebSocket.Data) => {
      const parsedData: IFileChangedEvent = JSON.parse(data as string);
      this.notifyConnectedClients(parsedData);
    });
  }

  handleFileChange(eventType: string, filename: string) {
    /**
     * Bugfix for fs.watch often triggering events twice.
     * Ref https://stackoverflow.com/questions/12978924/fs-watch-fired-twice-when-i-change-the-watched-file 
     */
    if (filename === this._lastChangedFile.filename) {
      const now = Date.now();
      if (!this._lastChangedFile.timestamp || now - this._lastChangedFile.timestamp < 100) {
        return;
      }
    }

    for (let i = 0; i < (this._ignoredFileExtensions || []).length; ++i) {
      if (filename.endsWith(this._ignoredFileExtensions[i])) {
        return;
      }
    }

    const event: IFileChangedEvent = {
      filename,
      type: 'filechanged',
    }

    this.notifyConnectedClients(event);

    this._lastChangedFile = {
      filename,
      timestamp: Date.now(),
    }
  }

  notifyConnectedClients(event: IFileChangedEvent) {
    for (const socketId in this._connectedSockets) {
      this._connectedSockets[socketId].send(JSON.stringify(event));
    }
  }

  registerConnectedClients () {
    this._server.on('connection', (socket: WebSocket, request: IncomingMessage) => {
      const socketId = new Date().getMilliseconds();
      this._connectedSockets[socketId] = socket;
      this.handleIncomingMessages(socket);
      this.deregisterClientOnDisconnect(socket, socketId);
    });
  }

  watchFiles(path: string | string[]) {
    const paths = typeof path === 'string' ? [path] : path;
    
    for (let i = 0; i < paths.length; ++i) {
      const path = paths[i];
      // `recursive` works only on OSX and Windows.
      watch(path, {recursive: true}, this.handleFileChange);
    }
  }
}
