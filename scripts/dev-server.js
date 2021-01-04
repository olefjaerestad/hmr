/**
 * This file is just for hosting static files so we can 
 * test that our HMR functionality works as expected.
 */
import express from 'express';

const app = express();
const PORT = 9003;

app.use('/', express.static('static'));
app.use('/client', express.static('dist/client'));
app.listen(PORT, () => console.log(`Dev server listening at localhost:${PORT}`));
