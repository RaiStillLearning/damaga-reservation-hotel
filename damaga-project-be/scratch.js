const express = require('express');
const app = express();

try {
  app.options('(.*)', (req, res) => res.send('ok'));
  console.log("'(.*)' works");
} catch (e) { console.log(e.message); }

try {
  app.options('*', (req, res) => res.send('ok'));
  console.log("'*' works");
} catch (e) { console.log(e.message); }

try {
  app.options('/*', (req, res) => res.send('ok'));
  console.log("'/*' works");
} catch (e) { console.log(e.message); }

try {
  app.options('/{.*}', (req, res) => res.send('ok'));
  console.log("'/{.*}' works");
} catch (e) { console.log(e.message); }

try {
  app.options('/:path([^]*)', (req, res) => res.send('ok'));
  console.log("'/:path([^]*)' works");
} catch (e) { console.log(e.message); }

try {
  app.options('/*', (req, res) => res.send('ok'));
} catch (e) { console.log(e.message); }

