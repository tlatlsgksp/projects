const express = require('express');
const app = express();


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
  require('./route701');
  require('./route21');
  require('./route733');
  require('./location701');
  require('./location21');
  require('./location733');
  require('./predict701');
  require('./predict21');
  require('./predict733');
});

app.use(express.static(__dirname));

app.get('/predict', (요청, 응답) => {
  
});
