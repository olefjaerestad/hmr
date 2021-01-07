import { IFileChangedEvent } from '../types/types';
import { replaceNodesByFilename } from '../client-utils/client-utils.js';

interface IConstructorOptions {
  hostname: 'localhost' | string;
  onCloseCallback?: (e: CloseEvent) => any,
  onErrorCallback?: (e: Event) => any,
  onMessageCallback?: (e: IFileChangedEvent, client: Client) => any,
  onOpenCallback?: (e: Event) => any,
  port: number;
}

export class Client {
  _socket: WebSocket;
  _defaultOnMessageCallback(e: IFileChangedEvent) {
    if (e.type === 'serverrestart') {
      return location.reload();
    }

    const replacedNodesCount = this.replaceNodesByFilename(e.filename);
    console.log({filename: e.filename, type: e.type, replacedNodesCount});

    // Fallback to reload if all else fails.
    if (!replacedNodesCount) {
      // 1000 is a magic number waiting for dev files to be built. 
      // TODO: The setTimeout should be removed in final build.
      setTimeout(() => location.reload(), 1000);
    }
  }
  replaceNodesByFilename = replaceNodesByFilename;
  
  constructor(options: IConstructorOptions) {
    this._socket = new WebSocket(`ws://${options.hostname}:${options.port}`);

    this._socket.addEventListener('open', (e: Event) => {
      options.onOpenCallback && options.onOpenCallback(e);
    });

    this._socket.addEventListener('message', (e: MessageEvent) => {
      const data: IFileChangedEvent = JSON.parse(e.data);
      options.onMessageCallback ? options.onMessageCallback(data, this) : this._defaultOnMessageCallback(data);
    });

    this._socket.addEventListener('close', (e: CloseEvent) => {
      options.onCloseCallback && options.onCloseCallback(e);
    });

    this._socket.addEventListener('error', (e: Event) => {
      options.onErrorCallback && options.onErrorCallback(e);
    });
  }
}
