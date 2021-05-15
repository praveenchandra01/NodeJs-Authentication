const mongoose = require("mongoose");
const Userschema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  googleId: {
    type: String,
  },
  CreatedAt: {
    type: Date,
    default: Date.now() + 19800000, // Indian time zone
  },
  provider: {
    type: String,
  },
  resetToken: String,
  expireToken: Date,
});

const User = mongoose.model("User", Userschema);
module.exports = User;
