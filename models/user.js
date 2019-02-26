const mongodb = require("mongodb");

const getDb = require("../util/database").getDb;

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  addtoCart(product) {
    if (!this.cart) {
      this.cart = { items: [] };
    }
    const updatedCartItems = [...this.cart.items];
    const cartProductIndex = this.cart.items.findIndex(cartItem => {
      return cartItem.productId.toString() === product._id.toString();
    });

    let newQuantity = 1;
    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1; //fetch old qty and +1
      updatedCartItems[cartProductIndex].quantity = newQuantity; //replcae in new cart
    } else {
      updatedCartItems.push({
        productId: new mongodb.ObjectId(product._id),
        quantity: newQuantity
      });
    }
    const updatedCart = { items: updatedCartItems }; //update cart
    const db = getDb();
    return db.collection("users").updateOne(
      { _id: new mongodb.ObjectId(this._id) },
      { $set: { cart: updatedCart } } // get the user and update his cart
    );
  }

  deleteCartItemById(proId) {
    const updatedCartItems = this.cart.items.filter(
      item => item.productId.toString() !== proId.toString()
    ); //make sure is the same type string
    const updatedCart = { items: updatedCartItems }; //update cart
    const db = getDb();
    return db.collection("users").updateOne(
      { _id: new mongodb.ObjectId(this._id) },
      { $set: { cart: updatedCart } } // get the user and update his cart
    );
  }

  getCart() {
    if (!this.cart) {
      this.cart = { items: [] };
    }
    const db = getDb();
    const cartProductIds = this.cart.items.map(item => {
      return item.productId;
    });
    return db
      .collection("products")
      .find({ _id: { $in: cartProductIds } }) //mongodb method $in:array
      .toArray()
      .then(products => {
        if (products.length !== cartProductIds.length) {
          return db
            .collection("users")
            .updateOne(
              { _id: new mongodb.ObjectId(this._id) },
              { $set: { cart: { items: [] } } }
            );
        }
        return products.map(product => {
          return {
            ...product,
            quantity: this.cart.items.find(item => {
              return item.productId.toString() === product._id.toString();
            }).quantity
          };
        });
      })
      .catch(err => console.log(err));
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
      .then(products => {
        const order = {
          items: products,
          user: {
            name: this.name,
            userId: new mongodb.ObjectId(this._id)
          }
        };
        return db.collection("orders").insertOne(order);
      })

      .then(result => {
        this.cart = { items: [] };
        return db
          .collection("users")
          .updateOne(
            { _id: new mongodb.ObjectId(this._id) },
            { $set: { cart: { items: [] } } }
          );
      })
      .catch(err => console.log(err));
  }

  getOrders() {
    const db = getDb();
    return db
      .collection("orders")
      .find({ "user.userId": new mongodb.ObjectId(this._id) }) // check user._id need to add ""
      .toArray();
  }
  static findById(id) {
    const db = getDb();
    return db
      .collection("users")
      .findOne({ _id: new mongodb.ObjectId(id) })
      .then(user => {
        if (!user) {
          return "no match user";
        }
        return user;
      })
      .catch(err => console.log(err));
  }
}

module.exports = User;
