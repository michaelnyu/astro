const db = require('./db');

class Message {
  async setup() {
    try {
      await db.query(
        'CREATE TABLE message (id SERIAL PRIMARY KEY, text VARCHAR(1023) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);',
        [],
      );
      return null;
    } catch (err) {
      return err;
    }
  }

  async get({ id }) {
    try {
      const { rows } = await db.query('SELECT * FROM message WHERE id=$1;', [
        id,
      ]);
      return [rows[0], null];
    } catch (err) {
      return [null, err];
    }
  }

  async getAll({ offset = 0, limit = 5000 }) {
    console.log({ offset, limit });
    try {
      const { rows } = await db.query(
        'SELECT * FROM message LIMIT $1 OFFSET $2',
        [limit, offset],
      );
      return [rows, null];
    } catch (err) {
      return [null, err];
    }
  }

  async create({ text }) {
    try {
      await db.query('INSERT INTO message (text) VALUES ($1);', [text]);
      return null;
    } catch (err) {
      return err;
    }
  }
}

module.exports = Message;
