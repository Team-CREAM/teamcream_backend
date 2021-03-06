require('./models/User');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const requireAuth = require('./middlewares/requireAuth');

// add imports to routes here
const authRoutes = require('./routes/AuthRoutes');
const userRoutes = require('./routes/UserRoutes');
const inventoryRoutes = require('./routes/InventoryRoutes');
const homepageRoutes = require('./routes/HomepageRoutes');
const exploreRoute = require('./routes/ExploreRoute');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(`${__dirname}/reset`));
// app.get('/resetpassword', (req, res) => {
//   res.sendFile(`${__dirname}/reset/index.html`);
// });

// Json
app.use(bodyParser.json());

// App use routes
app.use(authRoutes);

app.use(userRoutes);

app.use(inventoryRoutes);
app.use(homepageRoutes);
app.use(exploreRoute);

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

app.listen(PORT, () => {
  console.log('Listening on port 3000');
});
