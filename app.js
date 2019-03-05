const path = require("path");

const express = require("express");
const bodyParser = require("body-parser"); // encryipt
const mongoose = require("mongoose"); // make mongodb easier
const session = require("express-session"); // cookie and session
const MongoDBStore = require("connect-mongodb-session")(session); //session /express-session
const csrf = require("csurf"); //csrfToken protect cross site attack
const flash = require("connect-flash"); //for short store session

const errorController = require("./controllers/error");
const User = require("./models/user");
const MONGODB_URI =
  "mongodb+srv://ginnnnnn66666:HCb0qDZzL6TeOOJA@cluster0-d7kb8.mongodb.net/shop?retryWrites=true";

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions"
});
const csrfProtection = csrf(); //default store in session

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "vicky zhao",
    resave: false,
    saveUninitialized: false,
    store: store
  })
); // express-session setting secret hash resave false only save when change
//session is middleware use req.session

app.use(csrfProtection); //set after ue initailise the session
app.use(flash()); // set as middlleware

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id) // fetch user from session of db by _id
    .then(user => {
      req.user = user; //this action make user has mongoose method
      next();
    })
    .catch(err => console.log(err));
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn; //locals ,expressjs method render to views
  res.locals.csrfToken = req.csrfToken(); // pass csrfToken to views
  next();
});

app.use("/", shopRoutes);
app.use("/", authRoutes);

app.use("/admin", adminRoutes); //set all routes from admin.js in sub folder /admin
// app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    app.listen(3000);
  })
  .catch(err => console.log(err));
