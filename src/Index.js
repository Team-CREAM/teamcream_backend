require('./models/User');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const requireAuth = require('./middlewares/requireAuth');

// add imports to routes here
const authRoutes = require('./routes/AuthRoutes');

const app = express();

// Json
app.use(bodyParser.json());

// App use routes
app.use(authRoutes);

const mongoUri =
  'mongodb+srv://cse110:gary@cwc.l4ds3.mongodb.net/<dbname>?retryWrites=true&w=majority';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to mongo instance');
});
mongoose.connection.on('error', (err) => {
  console.log('Error connecting to mongo instance', err);
});

app.get('/', requireAuth, (req, res) => {
  res.send(req.user);
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
