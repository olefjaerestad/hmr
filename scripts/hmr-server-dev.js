import { Server } from '../dist/server';
import { join } from 'path';
import { fileURLToPath } from 'url';

new Server({
  hostname: 'localhost',
  port: 9001,
  watch: {
    path: [
      // join(fileURLToPath(import.meta.url), '../../dist/classes'),
      // join(fileURLToPath(import.meta.url), '../../dist/exports'),
      // join(fileURLToPath(import.meta.url), '../../dist/client-utils'),
      // join(fileURLToPath(import.meta.url), '../../dist/server-utils'),
      join(fileURLToPath(import.meta.url), '../../dist'),
      join(fileURLToPath(import.meta.url), '../../static'),
    ],
    ignoredFileExtensions: ['.d.ts', '.tsbuildinfo'],
  }
});
