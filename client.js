// IE needs these seven polyfills
import 'core-js/fn/promise';
import 'whatwg-fetch';
import 'abortcontroller-polyfill';
import 'web-streams-polyfill';
import fetchStream from 'fetch-readablestream';
if (!window.TextDecoder) {
  window.TextDecoder = require('text-encoding-polyfill').TextDecoder;
}
if (!window.TextEncoder) {
  window.TextEncoder = require('text-encoding-polyfill').TextEncoder;
}

import JSONStream from 'JSONstream';
import { Readable, Writable } from 'readable-stream';
import React from 'react';
import ReactDOM from 'react-dom';
import {Paper, Table, TableBody, TableCell, TableHead, TableRow} from 'material-react-components';

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
          {!!results && results.map((result => (
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

// Render on page load
ReactDOM.render(<App />, document.getElementById('app')); 

const controller = new AbortController();
const signal = controller.signal;

// Endpoint that returns 1,000,000 records
fetchStream(`${window.location.origin}/bigdata`, { signal })
  .then(async response => {
    // Wait a random amount of time before processing chunks
    const waitMs = Math.floor(Math.random() * 250) + 500; // 500-750
    await new Promise(resolve => setTimeout(resolve, waitMs));
    // Only record first 100 results
    let count = 0;
    const results = [];
    const reader = response.body.getReader();
    let chunk = await reader.read();
    const readableStream = new Readable({read() {}});
    const writableStream = new Writable({
      objectMode: true,
      write: (data, _, done) => {
        if (count === 100) {
          controller.abort();
          return done();
        }
        console.log('object', data);
        results.push(data);
        ReactDOM.render(
          <App results={results} />,
          document.getElementById('app')
        ); 
        count++;
        done();
      }
    });

    readableStream
      .pipe(JSONStream.parse('records.*'))
      .pipe(writableStream);

    while (chunk) {
      console.log('chunk', new TextDecoder('utf-8').decode(chunk.value));
      readableStream.push(chunk.value);
      chunk = await reader.read();
    }
  })
  .catch(e => {
    console.log(`Exception caught: ${e.message}`);
  });

