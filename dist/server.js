const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const zlib = require('zlib');

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/bigdata', (req, res) => {
  res.setHeader('Content-Encoding', 'chunked');
  const stream = zlib.createGzip();
  stream.pipe(res);
  stream.write('{"records":[\r\n');
  stream.flush();
  let index = 0;
  const interval = setInterval(() => {
    if (index === 60) {
      clearInterval(interval);
      stream.write(']}\r\n');
      return stream.push(null);
    }
    stream.write(`${index > 0 ? ',' : ''}{"id":"${index}","title":"Foo ${index}"}\r\n`);
    stream.flush();
    index = index + 1;
  }, 200);  
});

app.use(express.static(__dirname));

app.listen(8081, () => console.log('Listening on http://0.0.0.0:8081/'));
