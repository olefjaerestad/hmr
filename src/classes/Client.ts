import { IFileChangedEvent } from '../types/types';
import { replaceNodesByFilename } from '../client-utils/client-utils.js';

interface IConstructorOptions {
  hostname: 'localhost' | string;
  onCloseCallback?: (e: CloseEvent) => any,
  onErrorCallback?: (e: Event) => any,
  onMessageCallback?: (e: IFileChangedEvent, client: Client) => any,
  onOpenCallback?: (e: Event) => any,
  port: number;
  verbose?: boolean;
  doJsHmr?: boolean;
}

export class Client {
  _defaultOnMessageCallback(e: IFileChangedEvent) {
    if (e.type === 'restart') {
      if (this._verbose) {
        console.info('[HMR] Reloading due to restart');
      }
      return location.reload();
    }

    const replacedNodesCount = this.replaceNodesByFilename({
      filename: e.filename,
      includeJs: this._doJsHmr,
      verbose: this._verbose,
    });

    // Fallback to reload if all else fails.
    if (!replacedNodesCount) {
      if ('__ROLLUP_REPLACE_WITH_EMPTY_STRING__') {
        // 1000 is a magic number waiting for dev files to be built. 
        // setTimeout is removed in final build.
        setTimeout(() => {
          if (this._verbose) {
            console.info(`[HMR] Reloading due to file change: ${e.filename}`);
          }
          location.reload()
        }, 1000);
      } else {
        if (this._verbose) {
          console.info(`[HMR] Reloading due to file change: ${e.filename}`);
        }
        location.reload();
      }
    }
  }
  _doJsHmr: boolean;
  _socket: WebSocket;
  _verbose: boolean;
  replaceNodesByFilename = replaceNodesByFilename;
  
  constructor(options: IConstructorOptions) {
    this._doJsHmr = options.doJsHmr;
    this._socket = new WebSocket(`ws://${options.hostname}:${options.port}`);
    this._verbose = options.verbose;

    this._socket.addEventListener('open', (e: Event) => {
      if (this._verbose) {
        console.info('[HMR] Connected successfully');
      }
      options.onOpenCallback && options.onOpenCallback(e);
    });

    this._socket.addEventListener('message', (e: MessageEvent) => {
      const data: IFileChangedEvent = JSON.parse(e.data);
      options.onMessageCallback ? options.onMessageCallback(data, this) : this._defaultOnMessageCallback(data);
    });

    this._socket.addEventListener('close', (e: CloseEvent) => {
      if (this._verbose) {
        console.warn('[HMR] Connection closed', e);
      }
      options.onCloseCallback && options.onCloseCallback(e);
    });

    this._socket.addEventListener('error', (e: Event) => {
      if (this._verbose) {
        console.error('[HMR] A connection error occured', e);
      }
      options.onErrorCallback && options.onErrorCallback(e);
    });
  }
}
