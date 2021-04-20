require('dotenv').config();
const express = require('express')
const app = express();
const bodyParser = require('body-parser');
const cors = require("cors");
const logger = require('morgan')

app.use(cors());
      

app.use(logger('dev'));
app.use(express.static(`${__dirname}/public`));
app.use(express.json());


app.get("/", (req, res) => {
  res.json({ message: "Welcome expense trend" });
});

require('./routes/transaction')(app);

app.use((req, res, next)  => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
});

const PORT = parseInt(process.env.PORT, 10) || 4001;
app.listen(PORT, (err) => {
  if (err) {
    console.error(`Error starting the app:${err}`)
  }
  console.info(`The server is running on localhost PORT: ${PORT}`);
});

module.exports = app;