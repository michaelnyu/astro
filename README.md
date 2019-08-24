## setup

get postgres running

set up a database that is defined by a file called dbConfig.js in the root level of this project.

for development purposes:

```js
const dbConfigDev = {
  host: 'localhost',
  user: 'astro_main',
  database: 'astro_db',
  password: 'password',
  port: 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

module.exports = {**dbConfigDev**};
```
