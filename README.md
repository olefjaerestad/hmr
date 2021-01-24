# hmr
Hot Module Reloading server and client side scripts. All you need to get up and running with HMR in your project.

HMR for:
- CSS
- Images

Automatic full refresh for:
- HTML
- JS, with experimental HMR support for JS modules (`script[type="module"]`).

## Requirements
Browser and Node environments supporting the following: 
- ES modules
- Classes

## How to use
Create a hmr-server.js and add the following. Feel free to tweak the `Server` parameters as you see fit:

```javascript
import { Server } from '@olefjaerestad/hmr';
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

Run `node hmr-server.js`. This will start watching the given paths recursively for file changes. The paths don't have to exist at the time the script starts running, which might be useful in some dev setups. A good idea would be to use something like [Concurrently](https://www.npmjs.com/package/concurrently) and run this script in parallel with your other dev script(s).

> Note: This package is an ES module, and as such requires either setting `"type": "module"` in your package.json or using an .mjs extension `hmr-server.mjs`.

Add the following somewhere in your client side code (e.g. create a hmr-client.js and include it in your markup):

```javascript
/**
 * Note: if not using a bundler or similar, the import path must point to node_modules, e.g.
 * '../node_modules/@olefjaerestad/hmr/build/client.js'.
 */
import { Client } from '@olefjaerestad/hmr/build/client.js';

new Client({
  hostname: 'localhost',
  port: 9001,
  onMessageCallback: (e, client) => {
    console.log('Client.onMessageCallback()');
    console.log(e);
    client.replaceNodesByFilename({filename: e.filename});
  },
  onOpenCallback: (e) => console.log(e),
  onCloseCallback: (e) => console.log(e),
  onErrorCallback: (e) => console.log(e),
});
```

This will connect your browser to the HMR Server, and you'll be notified when any of the watched files change.

> Note, if you're making a separate file with this content, make sure to mark it as a module when including it in your html (`<script type="module">`).

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
    ignoredFileExtensions // string[]. Optional. Example: ['.d.ts', '.tsbuildinfo']
    path: [ // string or string[]. Required.
      join(fileURLToPath(import.meta.url), '../../dist'),
      join(fileURLToPath(import.meta.url), '../../../somefolder'),
      join(fileURLToPath(import.meta.url), '/../anotherfolder'),
      join(fileURLToPath(import.meta.url), './../yetanotherfolder/file.js'),
    ],
    verbose: true, // Optional. Outputs file events to console. Useful for debugging. Default: false.
  }
});
```

#### Server._connectedSockets
`{[id: number]: WebSocket}`

#### Server._ignoredFileExtensions
`string[]`

#### Server._lastChangedFile
`{filename?: string, timestamp?: number}`

#### Server._server
`WebSocket.Server`

[https://github.com/websockets/ws#simple-server](https://github.com/websockets/ws#simple-server)

#### Server._verbose
`boolean`

### Client
```javascript
new Client({
  hostname: 'localhost', // Must match hostname of Server. Required.
  port: 9001, // Must match port of Server. Required.
  onMessageCallback: (e: IFileChangedEvent, client: Client) => { // Run callback on file changes. Optional. If not passed, fallbacks to a default (and hopefully reasonable) behaviour.
    // client refers to the newly created instance:
    client.replaceNodesByFilename({ 
      filename: e.filename,
      includeJs: client._doJsHmr,
      verbose: client._verbose,
    });
  },
  onOpenCallback: (e: Event, client: Client) => console.log(e), // Run callback on connection to Server. Optional.
  onCloseCallback: (e: CloseEvent, client: Client) => console.log(e), // Run callback on disconnection from Server. Optional.
  onErrorCallback: (e: Event, client: Client) => console.log(e), // Run callback on connection error. Optional.
  verbose: true, // Optional. Outputs connection/file events to console. Useful for debugging. Default: false.
  doJsHmr: true, // Do HMR instead of page refresh for changes to javascript modules. This is experimental and quite buggy. Use at your own risk. Default: false.
});
```

#### Client._defaultOnMessageCallback: 
Used on file changes if you don't pass an `onMessageCallback` to the Client constructor.

`(e: IFileChangedEvent) => void`

#### Client._doJsHmr
`boolean`

#### Client._socket
`WebSocket`

#### Client._verbose
`boolean`

#### Client.replaceNodesByFilename({filename: string, includeJs?: boolean = false, verbose?: boolean = false}): number
Replace nodes which reference filename (e.g. CSS <link>s). Return number of replaced nodes.

### Utility functions

#### notify
Server side function you can use to manually notify all connected clients. This was originally created to allow web servers to notify clients whenever it restarted.

```javascript
import { notify } from '@olefjaerestad/hmr';

notify({
  hostname: 'localhost', // Must match hostname of Server. Required.
  port: 9001, // Must match port of Server. Required.
  event: { // IFileChangedEvent. Required.
    type: 'serverrestart',
  }
});
```

### Typescript
#### IFileChangedEvent
Event emitted when files are changed.

```javascript
interface IFileChangedEvent {
  filename?: string;
  type: 'filechanged' | 'serverrestart';
}
```

## Dev
`npm i`

`npm run dev`

Open localhost:9000 in your browser.

Make a change to a file in `src` to trigger HMR.
Save (no need to make any change) a file in `static` to trigger HMR.
Save (no need to make any change) scripts/dev-server.js to trigger HMR.

A good starting point for getting to know the project is to have a look at the following files:
- `src/client.ts`
- `src/server.ts`
- `scripts/dev-server.js`
- `scripts/hmr-server-dev.js`
- `static/hmr-client-dev.js`
- `package.json#scripts`
- `nodemon.*.json`

> While developing, you can use the string `'__ROLLUP_REPLACE_WITH_EMPTY_STRING__'`. This will be replaced with an empty string when building project. Handy for tree shaking (e.g. in if statements).

## Build
`npm i`

`npm run build`

`npm run start`

Open localhost:9000/index-prod.html in your browser.

## Todo
- Add (unit) tests.

## FAQ
### Why opt-in HMR for JS?
When replacing scripts, if the replaced script contains `addEventListener`, that event listener will fire as many times as the script has been replaced. This happens because scripts stay in memory even after they've been removed from DOM. This could also lead to huge memory leaks. This would be a less than ideal default. By opting in to JS HMR, you risk experiencing both these issues.
