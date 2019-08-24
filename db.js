const { Pool } = require('pg');
const { dbConfigDev } = require('./dbConfig');

const pool = new Pool(dbConfigDev);
const db = {
  query: (text, params) => pool.query(text, params),
};

module.exports = db;
