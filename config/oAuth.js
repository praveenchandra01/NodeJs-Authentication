const GoogleStrategy = require("passport-google-oauth20").Strategy;

const User = require("../models/User");
const keys = require("./keys");

module.exports = function (passport)  //Passed in from app.js file
{
  passport.use(
    new GoogleStrategy(
      {
        clientID: keys.clientId,
        clientSecret: keys.clientSecret,
        callbackURL: "http://localhost:5000/users/google/callback",
      },
      function (accessToken, refreshToken, profile, done) {
        const newUser = {
          name: profile.displayName,
          googleId: profile.id,
          provider: "google",
        };
        User.findOne({ googleId: newUser.googleId }).then((currentUser) => {
          if (currentUser) {  //if we already have a record with the given profile ID
            done(null, currentUser);
          } else {            //if not, create a new user
            User.create(newUser)
              .then((newUser) => {
                done(null, newUser);
              })
              .catch((err) => {
                console.log(err);
              });
          }
        });
      }
    )
  );

  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  });
};
