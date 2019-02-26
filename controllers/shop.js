const Product = require("../models/product");
const User = require("../models/user");

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then(products => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Shop",
        path: "/product-list"
      });
    })
    .catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prdId = req.params.productId;
  console.log(prdId);
  Product.findById(prdId)
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
  Product.fetchAll()
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
    .getCart()
    .then(products => {
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prdId = req.body.productId;
  Product.findById(prdId)
    .then(product => {
      return req.user.addtoCart(product);
    })
    .then(result => {
      res.redirect("/cart");
    })
    .catch(err => console.log(err));
};

exports.postCartdelProduct = (req, res, next) => {
  const prdId = req.body.productId;
  req.user
    .deleteCartItemById(prdId)
    .then(result => {
      res.redirect("/cart");
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .addOrder()
    .then(result => {
      res.redirect("/orders");
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders()
    .then(orders => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your orders",
        orders: orders
      });
    })
    .catch(err => console.log(err));
};
