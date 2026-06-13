const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.post('/foo', (req, res) => res.json({foo: 'bar'}));

app.listen(5002, () => console.log('started'));
