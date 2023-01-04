const mongoose = require('mongoose');

async function main() {
  mongoose.set('strictQuery', false);
  await mongoose.connect(
    `mongodb+srv://admin:${process.env.MONGODB_PASSWORD}@petadoption.dmocety.mongodb.net/test`
  );

  console.log('Connected to Mongoose!!!');
}

main().catch((err) => {
  console.log('ERROR:', err);
});

module.exports = mongoose;
