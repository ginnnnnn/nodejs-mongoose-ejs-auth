const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("5c74e76292f4a2caa4b0bad8")
    .then(user => {
      req.user = user; //mongoose user has method no return anything and next()
      next();
    })
    .catch(err => console.log(err));
});

app.use("/", shopRoutes);

app.use("/admin", adminRoutes); //set all routes from admin.js in sub folder /admin
// app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    "mongodb+srv://<mongoDb-ID>:<mongoDb-password>@cluster0-d7kb8.mongodb.net/shop?retryWrites=true",
    { useNewUrlParser: true }
  )
  .then(() => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: "Austin",
          email: "aginlo@test.com",
          cart: { items: [] }
        }); //mongoose create new user and save it
        user.save();
      }
    });
    app.listen(3000);
  })
  .catch(err => console.log(err));
