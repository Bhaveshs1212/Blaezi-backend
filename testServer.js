const express = require('express');
const app = express();

app.get('/ping', (req, res) => {
  res.send('PONG');
});

app.listen(4000, () => {
  console.log('TEST SERVER RUNNING ON 4000');
});
