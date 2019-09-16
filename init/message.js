// CURRENTLY NOT IN USE

const Message = require('../message');

const message = new Message();
message
  .setup()
  .then(() => {
    console.log('Database setup complete.');
  })
  .catch(err => {
    console.log('Database setup error: ', err);
  });
