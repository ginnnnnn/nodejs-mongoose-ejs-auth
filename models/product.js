const mongodb = require("mongodb");

const getDb = require("../util/database").getDb;

class Product {
  constructor(title, imageUrl, description, price, id, userId) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
    this._id = id ? new mongodb.ObjectId(id) : null;
    this.userId = userId;
  } // id has to be mongodb Id BSON for updateing or null for creating

  save() {
    const db = getDb();
    let dbOp;
    if (this._id) {
      dbOp = db
        .collection("products")
        .updateOne({ _id: this._id }, { $set: this });
      // update product require 2 agrment condition and action $set is reserve syntax this can be {title:this.title}
    } else {
      dbOp = db.collection("products").insertOne(this);
    }
    return dbOp.then();
  }

  static findById(prdid) {
    const db = getDb();
    return db
      .collection("products")
      .find({ _id: new mongodb.ObjectId(prdid) }) //mongodb store id as _id and mongodb.ObjectId(prdid) make it BSON
      .next()
      .then(product => {
        if (!product) {
          return console.log("no match");
        }
        return product;
      })
      .catch(err => console.log(err));
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection("products")
      .find()
      .toArray()
      .then(products => {
        return products;
      })
      .catch(err => console.log(err));
  }
  static deletebyId(id) {
    const db = getDb();
    return db
      .collection("products")
      .deleteOne({ _id: new mongodb.ObjectId(id) });
  }
}
module.exports = Product;
