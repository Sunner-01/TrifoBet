const sql = require('mssql');

const config = {
  user: 'sa',
  password: '123',
  server: 'localhost',
  database: 'TRIFO_BET',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  port: 1433,
};

let pool;

async function getConnection() {
  try {
    if (!pool) {
      pool = await sql.connect(config);
      console.log('Conexión a la base de datos establecida exitosamente a las', new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz' }));
      pool.on('error', async (err) => {
        console.error('Error en la conexión:', err);
        await reconnect();
      });
    }
    return pool;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    await reconnect();
    throw error;
  }
}

async function reconnect() {
  console.log('Intentando reconectar a la base de datos...');
  await new Promise((resolve) => setTimeout(resolve, 5000));
  pool = await sql.connect(config);
  console.log('Reconexión exitosa a las', new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz' }));
}

module.exports = { getConnection };