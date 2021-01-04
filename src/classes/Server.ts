import WebSocket from 'ws';
import { IFileChangedEvent } from "../types/types";
import { IncomingMessage } from 'http';
import { watch } from 'fs';

interface IConstructorParam {
  port: number;
  watch: {
    path: string | string[];
  }
}

export class Server {
  connectedSockets: {[id: number]: WebSocket} = {};
  doFireWatchEvent: boolean = true;
  server: WebSocket.Server;

  constructor(options: IConstructorParam) {
    this.server = new WebSocket.Server({
      port: options.port,
    });

    this.handleFileChange = this.handleFileChange.bind(this);

    this.registerConnectedClients();
    this.watchFiles(options.watch.path);
  }

  handleFileChange(eventType: string, filename: string) {
    if (this.doFireWatchEvent) {
      this.doFireWatchEvent = false;
      const event: IFileChangedEvent = {
        filename,
        type: 'filechanged',
      }
  
      for (const socketId in this.connectedSockets) {
        this.connectedSockets[socketId].send(JSON.stringify(event));
      }
  
      // Only register changes max once every 1000ms.
      setTimeout(() => this.doFireWatchEvent = true, 1000);
    }
  }

  notifyConnectedClients(event: IFileChangedEvent) {
    for (const socketId in this.connectedSockets) {
      this.connectedSockets[socketId].send(JSON.stringify(event));
    }
  }

  registerConnectedClients () {
    this.server.on('connection', (socket: WebSocket, request: IncomingMessage) => {
      const socketId = new Date().getMilliseconds();
      this.connectedSockets[socketId] = socket;

      socket.on('close', (code: number, reason: string) => {
        delete this.connectedSockets[socketId];
      });
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
