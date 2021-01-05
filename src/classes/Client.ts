/**
 * Load this script client side. 
 * Requires server/server.js to be used on the server side in order to work.
 */

import { IFileChangedEvent } from '../types/types';

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
    // TODO: Are we able to catch changes to files included (ESM) in our client scripts?
    console.log('Client._defaultOnMessageCallback()');
    console.log(e);
    if (e.type === 'serverrestart') {
      return location.reload();
    }

    const replacedNodesCount = this.replaceNodeByFilename(e.filename);

    // Fallback to reload if all else fails.
    if (!replacedNodesCount) {
      // TODO: 1000 is a magic number waiting for files to be built. Should find a more solid solution.
      setTimeout(() => location.reload(), 1000);
    }
  }

  replaceNodeByFilename = replaceNodeByFilename;
  
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

/**
 * Replace script tags and CSS links matching filename.
 * Return number of replaced nodes.
 */
function replaceNodeByFilename(filename: string): void | number {
  if (!filename) {
    return;
  }
  
  // TODO: Would be good to have filepath available here, so we dont accidentally 
  // replace the wrong script/link tag in case of multiple scripts/links with same filename,
  // e.g. multiple index.js or multiple style.css.
  // Alternatively only allow replacing scripts/links from our own domain (no silver bullet).
  const isJs = filename.endsWith('.js');
  const isCss = filename.endsWith('.css');
  let tag = '';
  let selector = '';
  if (isJs) {
    tag = 'script';
    selector = `${tag}[src*="${filename}"]`;
  } else if (isCss) {
    tag = 'link';
    selector = `${tag}[href*="${filename}"]`;
  }
  if (!selector) {
    return;
  }

  // TODO: Replace with querySelector()?
  const elements = document.querySelectorAll(selector);
  elements.forEach((element: HTMLScriptElement | HTMLLinkElement) => {
    /**
     * We can't use Node.cloneNode. Ref:
     * https://stackoverflow.com/questions/28771542/why-dont-clonenode-script-tags-execute
     * https://html.spec.whatwg.org/multipage/scripting.html#script-processing-model
     */
    const newElement = document.createElement(tag);
    const attributeNames = element.getAttributeNames();
    for (let i = 0; i < attributeNames.length; ++i) {
      newElement.setAttribute(
        attributeNames[i],
        element.getAttribute(attributeNames[i])
      );
    }
    element.parentElement.replaceChild(newElement, element);
  });

  return elements.length;
}
