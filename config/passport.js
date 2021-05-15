const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

//Load User model
const User = require("../models/User");

module.exports = function (passport) //Passed in from app.js file
 {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      //Match User
      User.findOne({ email: email })//return user or null
        .then(user => {
          if (!user) {
            return done(null, false, {
              message: "That email is not registered",
            });
          }
          //Match password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (isMatch) {
              return done(null, user); 
            } else {
              return done(null, false, { message: "Password incorrect" });
            }
          });
        })
        .catch((err) => console.log(err));
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
};
