const { MongoClient } = require('mongodb');
const config = require('./config');

const { dbUrl } = config;

const client = new MongoClient(dbUrl, { useUnifiedTopology: true });
let db;

async function connect() {
  try {
    await client.connect();
    db = client.db('DB_burguer-queen');
    console.log('--- Connected to the database');
    return db;
  } catch (error) {
    console.error('Error connecting to the database', error);
    throw error;
  }
}

async function disconnect() {
  try {
    await client.close();
    console.log('Disconnected from the database');
  } catch (error) {
    console.error('Error disconnecting from the database', error);
  }
}

module.exports = { connect, disconnect, db };
