// IE needs these two polyfills
import 'core-js/fn/promise';
import 'whatwg-fetch';
import JSONStream from 'JSONstream';
import { Readable, Writable } from 'readable-stream';
import React from 'react';
import ReactDOM from 'react-dom';
import {Paper, Table, TableBody, TableCell, TableHead, TableRow} from 'material-react-components';

const results = [];
const node = document.createElement('div');
document.body.appendChild(node);

const App = ({results}) => (
  <div style={{width: '500px', margin: '0 auto'}}>
    <Paper elevation={3}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>id</TableCell>
            <TableCell>title</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map((result => (
            <TableRow key={result.id}>
              <TableCell>{result.id}</TableCell>
              <TableCell>{result.title}</TableCell>
            </TableRow>
          )))}
        </TableBody>
      </Table>
    </Paper>
  </div>
);

// Only record first 100 results
let count = 0;
const readableStream = new Readable({read() {}});
const writableStream = new Writable({
  objectMode: true,
  write: (data, _, done) => {
    if (count > 100) {
      return;
    }
    ReactDOM.render(<App results={results} />, node);
    results.push(data);
    count++;
    done();
  }
})

// Endpoint that returns 1,000,000 records
fetch(`${window.location.origin}/bigdata`)
  .then(async response => {
    const reader = response.body.getReader();
    let chunk = await reader.read();
    while (chunk) {
      readableStream.push(chunk.value);
      chunk = await reader.read();
    }
  });

readableStream
  .pipe(JSONStream.parse('records.*'))
  .pipe(writableStream);
