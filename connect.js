const { MongoClient } = require('mongodb');
const config = require('./config');

const { dbUrl } = config;

const client = new MongoClient(dbUrl, { useUnifiedTopology: true });
let db;

async function connect() {
  // TODO: Conexión a la Base de Datos
  try {
    await client.connect();
    const db = client.db('DB_burguer-queen');
    console.log('--- Connected to the database');
  } catch (error) {
    console.error('Error connecting to the database', error);
    throw error; // Re-lanza el error para que el código que llame a esta función lo maneje
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
