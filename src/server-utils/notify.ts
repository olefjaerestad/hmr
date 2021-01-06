import WebSocket from 'ws';
import { IFileChangedEvent } from '../types/types';

interface IOptions {
  hostname: 'localhost' | string;
  port: number;
  event: IFileChangedEvent;
}

export function notify(options: IOptions): void | Error {
  if (!options.hostname || !options.port || !options.event) {
    throw new Error(
      '[HMR] notify() requires hostname (received ' + options.hostname + 
      ', port (received ' + options.port + 
      ') and event (received ' + options.event + ').'
    );
  }
  let socket: WebSocket = new WebSocket(`ws://${options.hostname}:${options.port}`);
  socket.on('open', () => {
    socket.send(JSON.stringify(options.event));
    socket = undefined; // Ready for garbage collection.
  });
}
