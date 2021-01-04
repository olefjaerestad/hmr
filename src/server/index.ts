import { Agent, request } from 'http';
import { IFileChangedEvent } from '../types/types';

const agent = new Agent({
  keepAlive: true,
  maxSockets: 1,
});

export function notify(event: IFileChangedEvent): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = request({
      agent,
      hostname: 'localhost',
      method: 'GET',
      // TODO: Make this configurable:
      port: 9001,
      path: `/?filename=${event.filename}&type=${event.type}`
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk.toString();
      });
      res.on('end', () => {
        resolve(data);
      });
      res.on('error', (err: Error) => {
        reject(err);
      })
    });
    
    req.end();
  });
}
