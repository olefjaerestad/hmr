/**
 * This file is just for hosting static files so we can 
 * test that our HMR functionality works as expected.
 * Save this file and watch the browser window update.
 */
import express from 'express';
import { notify } from '../dist/exports/server';

const app = express();
const port = 9000;

app.use('/', express.static('static'));
app.use('/dist', express.static('dist'));
app.listen(port, () => {
  console.log(`Dev server listening at localhost:${port}`);
  
  notify({
    hostname: 'localhost',
    port: 9001,
    event: {
      type: 'serverrestart',
    }
  });
});
