const pg = require('pg');

const config = {
  user: process.env.db_user,
  database: process.env.db_name,
  password: process.env.db_password,
  port: 5432,
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
