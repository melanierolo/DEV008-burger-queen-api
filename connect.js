const mongoose = require('mongoose');
const config = require('./config');

const { dbUrl } = config;

async function connect() {
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    return mongoose.connection;
  } catch (error) {
    console.error('Error connecting to the database', error);
    throw error;
  }
}

async function disconnect() {
  try {
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error disconnecting from the database', error);
  }
}

module.exports = { connect, disconnect };
