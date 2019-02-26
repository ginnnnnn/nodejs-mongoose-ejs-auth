const mongodb = require("mongodb"); // npm install --save mongodb
const MongoClient = mongodb.MongoClient; //set up client

let _db;

const mongoConnect = callback => {
  MongoClient.connect("yourMongoDbUrl", { useNewUrlParser: true }) // ...mongodb.net/<database name>? ...
    .then(client => {
      console.log("connected");
      _db = client.db(); //set database to client
      callback();
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  } else {
    throw "no database found!";
  }
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
