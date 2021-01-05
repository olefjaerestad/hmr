import { Client } from '../dist/exports/client.js';

// TODO: This script doesn't rerun in browser when changed. watchme.js does.
// Seems to have to do with type="module".
console.log('hmrclient 1');

new Client({
  hostname: 'localhost',
  port: 9001,
  // onMessageCallback: (e, client) => {
  //   console.log('Client.onMessageCallback()');
  //   console.log(e);
  //   client.replaceNodeByFilename(e.filename);
  // },
  onOpenCallback: (e) => console.log(e),
  onCloseCallback: (e) => console.log(e),
  onErrorCallback: (e) => console.log(e),
});
