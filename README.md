# hmr
Hot Module Reloading server and client side scripts.

## How to use
Create a hmr-server.js and add the following. Feel free to tweak the `Server` parameters as you see fit:

```javascript
import { Server } from '@olefjaerestad/hmr/exports/server';
import { join } from 'path';
import { fileURLToPath } from 'url';

new Server({
  hostname: 'localhost',
  port: 9001,
  watch: {
    path: [
      join(fileURLToPath(import.meta.url), '../../dist'),
      join(fileURLToPath(import.meta.url), '../../../somefolder'),
      join(fileURLToPath(import.meta.url), '/../anotherfolder'),
    ]
  }
});
```

Run `node hmr-server.js`. This will start watching the given paths for file changes.

Add the following somewhere in your client side code:

```javascript
/**
 * Note: if not using a bundler or similar, the import path must point to node_modules, e.g.
 * '../node_modules/@olefjaerestad/hmr/exports/client.js'.
 */
import { Client } from '@olefjaerestad/hmr/exports/client.js';

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
```

This will connect your browser to the HMR Server, and you'll be notified when any of the watched files change.

## General idea
- To be used while developing.
- Keeps a websocket server running at all times.
- The websocket server watches for file changes and notifies connected clients.
- The clients decide themselves what they want to do when files change.
- Expose a JS API.
- No CLI API.

## Docs

### Server
```javascript
new Server({
  hostname: 'localhost', // Required.
  port: 9001, // Required.
  watch: { // Required.
    path: [ // string or string[]. Required.
      join(fileURLToPath(import.meta.url), '../../dist'),
      join(fileURLToPath(import.meta.url), '../../../somefolder'),
      join(fileURLToPath(import.meta.url), '/../anotherfolder'),
    ]
  }
});
```

#### Server._connectedSockets
`{[id: number]: WebSocket}`

#### Server._server
`WebSocket.Server`

### Client
```javascript
new Client({
  hostname: 'localhost', // Must match hostname of Server. Required.
  port: 9001, // Must match port of Server. Required.
  onMessageCallback: (e) => { // Run callback on file changes. Optional. If not passed, fallbacks to a default (and hopefully reasonable) behaviour.
    console.log('Client.onMessageCallback()');
    console.log(e);
  },
  onOpenCallback: (e) => console.log(e), // Run callback on connection to Server. Optional.
  onCloseCallback: (e) => console.log(e), // Run callback on disconnection from Server. Optional.
  onErrorCallback: (e) => console.log(e), // Run callback on connection error. Optional.
});
```

#### Client._socket
`WebSocket`

#### Client._defaultOnMessageCallback: 
`(e: IFileChangedEvent) => void`

### Functions

#### notify
Server side function you can use to manually notify all connected clients. This was originally created to allow web servers to notify clients whenever it restarted.

```javascript
import { notify } from '@olefjaerestad/hmr/exports/server';

notify({
  hostname: 'localhost', // Must match hostname of Server. Required.
  port: 9001, // Must match port of Server. Required.
  event: { // IFileChangedEvent. Required.
    type: 'serverrestart',
  }
});
```

## Dev
`npm i`

`npm run dev`

Open localhost:9000 in your browser.

// TODO: Update the following section when Client._defaultOnMessageCallback is ready.
Make a change to any file in `static`, `src/classes`, `src/exports` or `src/server-helpers` to refresh the browser window code.
Make any change (e.g. add a space/newline) to scripts/dev-server.js to reload the browser window (due to a server restart).

A good starting point for getting to know the project is to have a look at the following files:
- `src/exports/client.ts`
- `src/exports/server.ts`
- `scripts/dev-server.js`
- `scripts/hmr-server.js`
- `static/hmr-client.js`
- `package.json#scripts`
- `nodemon.*.json`

## Todo
- nodemon: which scripts should restart when which files change?
- Keep import paths in readme updated.
- `npm run build`
- `npm run publish`

## Dont do:
- When used in external project, make available a `hmr` command. Update: Taking a JS API approach instead.
