const express = require('express');
const morgan = require('morgan');
const config = require('./config');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/error');
const routes = require('./routes');
const pkg = require('./package.json');
const { connect } = require('./connect.js');
const { port, secret } = config;
const cors = require('cors');

// Connect to MongoDB using Mongoose
connect();

const app = express();

app.set('config', config);
app.set('pkg', pkg);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(authMiddleware(secret));
app.use(morgan('dev'));

// CORS
const corsOptions = {
  origin: '*',
  methods: 'PUT,PATCH,GET,DELETE,POST',
};

app.use(cors(corsOptions));

routes(app, (err) => {
  if (err) {
    throw err;
  }

  app.use(errorHandler);
  app.listen(port, () => {
    console.info(`App listening on port ${port}`);
  });
});
