import express from 'express';
import { parse } from 'querystring';
// import fetch from 'node-fetch';
const app = express();
const port = 4004;

const endpoint = 'https://api.labs.cognitive.microsoft.com/academic/v1.0';

app.get('/api', (req, res) => {
  let parameters = parse(req.originalUrl);
  console.log('parameters', parameters);
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));
