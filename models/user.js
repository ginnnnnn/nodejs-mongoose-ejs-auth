const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  // title: String
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product", //make cart relate to Product so this productId will equal product id
          required: true
        },
        quantity: { type: Number, required: true }
      }
    ]
  }
});
// will auto generate user id -> _id BSON

userSchema.methods.addToCart = function(product) {
  // dont use arrow funtion here cus ,this has to refer this Schema
  const updatedCartItems = [...this.cart.items]; //this refer schema
  const cartProductIndex = this.cart.items.findIndex(cartItem => {
    return cartItem.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1; //fetch old qty and +1
    updatedCartItems[cartProductIndex].quantity = newQuantity; //replcae in new cart
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity
    });
  }
  const updatedCart = { items: updatedCartItems }; //update cart
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeCartItem = function(proId) {
  const updatedCartItems = this.cart.items.filter(
    item => item.productId.toString() !== proId.toString()
  ); //make sure is the same type string //update cart
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function() {
  this.cart.items = [];
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
