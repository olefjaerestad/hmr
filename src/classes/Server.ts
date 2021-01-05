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
  // _doFireWatchEvent: boolean = true;
  _server: WebSocket.Server;
  _ignoredFileExtensions: string[] = [];

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
    // if (this._doFireWatchEvent) {
      // this._doFireWatchEvent = false;
      for (let i = 0; i < (this._ignoredFileExtensions || []).length; ++i) {
        if (filename.endsWith(this._ignoredFileExtensions[i])) {
          return;
        }
      }
      
      const event: IFileChangedEvent = {
        filename,
        type: 'filechanged',
      }
  
      for (const socketId in this._connectedSockets) {
        this._connectedSockets[socketId].send(JSON.stringify(event));
      }
      
      // Only register changes max once every 1000ms.
      // TODO: Do we want this check?
      // setTimeout(() => this._doFireWatchEvent = true, 1000);
    // }
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
      watch(path, {recursive: true}, this.handleFileChange);
    }
  }
  
}
