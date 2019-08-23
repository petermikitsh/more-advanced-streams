const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/bigdata', (req, res) => {
  res.write('{"records":[');
  let index = 0;
  const interval = setInterval(() => {
    if (index === 1000000) {
      clearInterval(interval);
      res.write(']}');
      res.end();
      return;
    }
    res.write(`${index > 0 ? ',' : ''}{"id":"${index}","title":"Foo ${index}"}`);
    index = index + 1;
  }, 100);  
});

app.use(express.static(__dirname));

app.listen(8081, () => console.log('Listening on http://0.0.0.0:8081/'));
