/**
 * Load this script client side. 
 * Requires server/server.js to be used on the server side in order to work.
 */

import { IFileChangedEvent } from '../types/types';

interface IConstructorOptions {
  hostname: 'localhost' | string;
  onCloseCallback?: (e: CloseEvent) => any,
  onErrorCallback?: (e: Event) => any,
  onMessageCallback?: (e: IFileChangedEvent) => any,
  onOpenCallback?: (e: Event) => any,
  port: number;
}

export class Client {
  _socket: WebSocket;
  _defaultOnMessageCallback(e: IFileChangedEvent) {
    console.log('Client._defaultOnMessageCallback()');
    console.log(e);
    location.reload();
  }

  constructor(options: IConstructorOptions) {
    this._socket = new WebSocket(`ws://${options.hostname}:${options.port}`);

    this._socket.addEventListener('open', (e: Event) => {
      options.onOpenCallback && options.onOpenCallback(e);
    });

    this._socket.addEventListener('message', (e: MessageEvent) => {
      const data: IFileChangedEvent = JSON.parse(e.data);
      options.onMessageCallback ? options.onMessageCallback(data) : this._defaultOnMessageCallback(data);
    });

    this._socket.addEventListener('close', (e: CloseEvent) => {
      options.onCloseCallback && options.onCloseCallback(e);
    });

    this._socket.addEventListener('error', (e: Event) => {
      options.onErrorCallback && options.onErrorCallback(e);
    });
  }
}
