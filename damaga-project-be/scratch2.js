const express = require('express');
const app = express();

const patterns = [
  '/*path',
  '/{*path}',
  '/(.*)',
  '/*(.*)'
];

for (const p of patterns) {
  try {
    app.options(p, (req, res) => res.send('ok'));
    console.log(`'${p}' works`);
  } catch (e) {
    console.log(`'${p}' fails: ${e.message}`);
  }
}
