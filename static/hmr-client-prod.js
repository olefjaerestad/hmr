import { Client } from '../build/client.js';

new Client({
  hostname: 'localhost',
  port: 9001,
  // onMessageCallback: (e, client) => {
  //   console.log('Client.onMessageCallback()');
  //   console.log(e);
  //   client.replaceNodesByFilename({filename: e.filename});
  // },
  onOpenCallback: (e) => console.log(e),
  onCloseCallback: (e) => console.log(e),
  onErrorCallback: (e) => console.log(e),
});
