const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  connectionstring: process.env.CONNECTION_STRING,
  port: process.env.PORT,
  mongodb: process.env.MONGO_DATABASE,
  mongocollection: process.env.MONGO_COLLECTION
};
