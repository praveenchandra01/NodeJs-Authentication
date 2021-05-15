const express = require("express");
const expresslayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const passport = require("passport");
const favicon = require("serve-favicon");
const path = require("path");

const app = express();

//Passport config
require("./config/passport")(passport);
require("./config/oAuth")(passport);
// const passportconfig = require('./config/passport')
// passportconfig(passport);

// DB config - Connect to mongo
// const db = require("./config/keys").MongoURI;
// mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
mongoose
  .connect("mongodb://localhost/loginDatabase", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

// EJS
app.use(expresslayouts);
app.set("view engine", "ejs");

// Bodyparser
app.use(express.urlencoded({ extended: false }));

// Express Session Middleware
app.use(
  session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect flash
app.use(flash());

//Global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//Routes
// app.use('/',router); //for calling routes
app.use("/", require("./static/index"));
app.use("/users", require("./static/users"));
app.use("/static", express.static("static")); // For serving static files

app.use(favicon(path.join(__dirname, "static", "favicon.ico")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Listening on port ${PORT}`));
