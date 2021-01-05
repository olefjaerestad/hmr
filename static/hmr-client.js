import { Client } from '../dist/exports/client.js';

new Client({
  hostname: 'localhost',
  port: 9001,
  onMessageCallback: (e) => {
    console.log('Client.onMessageCallback()');
    console.log(e);
  },
  onOpenCallback: (e) => console.log(e),
  onCloseCallback: (e) => console.log(e),
  onErrorCallback: (e) => console.log(e),
});
