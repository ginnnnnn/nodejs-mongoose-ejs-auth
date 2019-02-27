const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const product = new Product({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
    userId: req.user // req.user._id , req.user also fine cus mongoose!
  }); // mongoose schema-> order does not matter here

  product
    .save() // mongoose method save()
    .then(result => {
      console.log("Create Product");
      res.redirect("/admin/products");
    })
    .catch(err => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit; // boolean, after/:id?edit=editMode
  if (!editMode) {
    return res.redirect("/");
  }
  const prdId = req.params.productId;
  // check route "/edit-product/:productId"
  Product.findById(prdId) // mongoose method
    .then(product => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product
      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const id = req.params.productId;
  const title = req.body.title;
  const price = req.body.price;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  Product.findById(id)
    .then(product => {
      product.title = title;
      product.price = price;
      product.imageUrl = imageUrl;
      product.description = description;
      return product.save();
    })
    .then(() => {
      res.redirect("/admin/products");
    })
    .catch(err => console.log(err));
};

exports.postDelProduct = (req, res, next) => {
  const prdId = req.body.productId;
  // Product.deleteOne({ _id: prdId })
  Product.findByIdAndRemove(prdId) //mongoose method
    .then(() => {
      console.log("delete");
      res.redirect("/admin/products");
    })
    .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.find()
    // .select("title -price") // "title" only show title "-price" dont show price
    // .populate("userId") //extra the path for userId
    .then(products => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "admin products page",
        path: "/admin/products"
      });
    })
    .catch(err => console.log(err));
};
