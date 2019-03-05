const Product = require("../models/product");
const Order = require("../models/order");

exports.getProducts = (req, res, next) => {
  const isAuthed = req.session.isLoggedIn;
  Product.find()
    .then(products => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Shop",
        path: "/products",
        isAuthenticated: isAuthed
      });
    })
    .catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prdId = req.params.productId;
  Product.findById(prdId) // mongoose method
    .then(product => {
      res.render("shop/product-details", {
        product: product,
        pageTitle: product.title,
        path: "/products"
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "welcome to my shop",
        path: "/"
      });
    })
    .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId") // create relate path to cart item
    .execPopulate() //  fetch the path
    .then(user => {
      user.cart.items.forEach(element => {
        if (!element.productId) {
          user.cart.items = [];
          return user.save();
        }
      });
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: user.cart.items
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prdId = req.body.productId;
  Product.findById(prdId)
    .then(product => {
      console.log(req.user);
      return req.user.addToCart(product);
    })
    .then(result => {
      res.redirect("/cart");
    })
    .catch(err => console.log(err));
};

exports.postCartdelProduct = (req, res, next) => {
  const prdId = req.body.productId;
  req.user
    .removeCartItem(prdId)
    .then(result => {
      res.redirect("/cart");
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then(user => {
      //this array
      const products = user.cart.items.map(i => {
        return {
          quantity: i.quantity,
          product: { ...i.productId._doc } // mongoose method  ._doc extract datas
        };
      });
      console.log(products);
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user // or req.user._id
        },
        products: products
      });
      return order.save();
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch(err => console.log()); // cus ref Product so this path will get info of product of cart
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user }) //mongoose find()method "nest props"
    .then(orders => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your orders",
        orders: orders
      });
    })
    .catch(err => console.log(err));
};
