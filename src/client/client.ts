/**
 * Load this script client side. 
 * Requires server.js to be used on the server side in order to work.
 */

import { IFileChangedEvent } from '../types/types';

// TODO: Make port configurable:
const socket: WebSocket = new WebSocket(`ws://${location.hostname}:9002`);

socket.addEventListener('message', (e: MessageEvent) => {
  const data: IFileChangedEvent = JSON.parse(e.data);

  console.log(data);

  // TODO: Act accordingly. Make this configurable? Let consumer pass their own callbacks?
  /* if (data.type === 'filechanged') {
    console.log(`${data.filename} changed`);
    // setTimeout(() => location.reload(), 2000);
  } */
  /* if (data.type === 'serverrestart') {
    console.log(`${data.filename} changed`);
    // location.reload();
    // setTimeout(() => location.reload(), 2000);
  } */
});

const events: string[] = ['open', 'close', 'error'];
events.forEach((eventName) => {
  socket.addEventListener(eventName, (event) => {
    console.log(eventName);
  });
});
