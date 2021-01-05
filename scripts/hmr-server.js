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
    ],
    ignoredFileExtensions: ['.d.ts'],
  }
});
