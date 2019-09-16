const dbConfigDev = {
  host: 'postgres',
  user: 'postgres',
  database: 'astro_db',
  password: 'password',
  port: 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

module.exports = { dbConfigDev };
