/**
 * This file is just for hosting static files so we can 
 * test that our HMR functionality works as expected.
 * Save this file and watch the browser window update.
 */
import express from 'express';
import { notify } from '../dist/server';

const app = express();
const port = 9000;

app.use('/', express.static('static'));
app.use('/dist', express.static('dist'));
app.use('/build', express.static('build'));
app.listen(port, () => {
  console.info(`Dev server listening at localhost:${port}`);
  
  notify({
    hostname: 'localhost',
    port: 9001,
    event: {
      type: 'serverrestart',
    }
  });
});
