const pg = require('pg');

const config = {
  connectionString: process.env.DATABASE_URL,
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000,
  ssl: {
    rejectUnauthorized: false
  }
};

const pool = new pg.Pool(config);

pool.on('connect', () => {
  console.log('connected to the Database');
});

module.exports = pool;
