/**
 * TODO: Usage on the server side:
 * import { notify } from './hmr/index';
 * watchFiles(path.join(__dirname, '../dist')) // path can be a directory or file and can also be string[]
 * notify({filename: 'dist/index.js', type: 'serverrestart'});
 */
import { Server } from '../dist/exports/server';
import { join } from 'path';
import { fileURLToPath } from 'url';

new Server({
  hostname: 'localhost',
  port: 9001,
  watch: {
    path: [
      join(fileURLToPath(import.meta.url), '../../dist/classes'),
      join(fileURLToPath(import.meta.url), '../../dist/exports'),
      join(fileURLToPath(import.meta.url), '../../dist/server-helpers'),
      join(fileURLToPath(import.meta.url), '../../static'),
    ]
  }
});
