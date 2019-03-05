const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    errorMessage: message // flash('key') return  an array.
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email }).then(user => {
    if (!user) {
      req.flash("error", "Invalid email or password."); //flash('key','message')
      return req.session.save(err => {
        res.redirect("/login"); // save() is not nessarry but it make sure it's done storeing
      });
    }
    bcrypt
      .compare(password, user.password)
      .then(doMatch => {
        //compare return a boolean
        if (doMatch) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save(err => {
            res.redirect("/"); // save() is not nessarry but it make sure it's done storeing
          });
        }
        req.flash("error", "Invalid email or password."); //flash('key','message')
        res.redirect("/login");
      })
      .catch(err => console.log(err));
  });
}; //very important!!this store in server memory before set connect-mongodb-session
//if too much it go overflow
// res.setHeader("Set-Cookie", "loggedIn=true ; Max-Age=20");
//this set for cookie!!'Set-Cookie' is reserved// 'loggedIn=true' is by own choice

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    // session method .destroy(err=>{}) clean session from database!!not client
    console.log(err);
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("email");
  let message2 = req.flash("password");

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  if (message2.length > 0) {
    message2 = message2[0];
  } else {
    message2 = null;
  }
  res.render("auth/Signup", {
    pageTitle: "Signup",
    path: "/Signup",
    emailMessage: message,
    passwordMessage: message2
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmedPassword = req.body.confirmPassword;
  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        req.flash("email", "email already exist");
        return req.session.save(err => {
          res.redirect("/signup"); // save() is not nessarry but it make sure it's done storeing
        });
      }
      if (password !== confirmedPassword) {
        req.flash("password", "password does not match");
        return req.session.save(err => {
          res.redirect("/signup"); // save() is not nessarry but it make sure it's done storeing
        });
      }
      return bcrypt
        .hash(password, 12)
        .then(hash => {
          const user = new User({
            email: email,
            password: hash,
            cart: { items: [] }
          });
          return user.save();
        })
        .then(() => {
          res.redirect("/login");
        });
    })
    .catch(err => {
      console.log(err);
    });
};
