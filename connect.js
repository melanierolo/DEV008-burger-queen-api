const { MongoClient } = require('mongodb');
const config = require('./config');

const { dbUrl } = config;

const client = new MongoClient(dbUrl, { useUnifiedTopology: true });

async function connect() {
  // TODO: Conexión a la Base de Datos
  let conn;
  try {
    conn = await client.connect();
    const db = client.db('mongodb://127.0.0.1:27017/DB_burguer-queen'); // Reemplaza <NOMBRE_DB> por el nombre del db
    return db;
  } catch (e) {
    console.error('Error connecting to the database', error);
  }
}

module.exports = { connect };
