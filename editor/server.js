const express = require('express');
const app = express();
app.use(express.static('client/public'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.post('/compile', (req, res) => {
  const code = req.body.code;
  const lang = req.body.lang;
  // TO DO: Compile code here
  res.json({ output: 'compiled successfully' });
});
app.listen(3000, () => {
  console.log('Editor server listening on port 3000');
});
app.get('/compiler', (req, res) => {
  res.redirect('https://ashokaurovindomohanty-hub.github.io/bipdeep.com/BipDeep/compiler/index.html');
});
