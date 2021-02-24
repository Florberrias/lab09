const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: (value) => {
      return validator.isEmail(value);
    },
  },
  password: { type: String, required: true, minlength: 5 },
  roles: { type: [{ type: String }], default: ["user"] },
});

const User = mongoose.model("User", schema, "users");

const getJwtBody = ({ _id, email, roles }) => ({ _id, email, roles });
// Add generateAuthToken() method, which generates and returns a JWT token
schema.methods.generateAuthToken = async function () {
  // Generate an auth token for the user
  const user = this;
  const token = jwt.sign(getJwtBody(user), process.env.JWT_KEY, {
    expiresIn: process.env.JWT_EXP,
  });
  return token;
};

// Add findByCredentials() method, which returns the user find in database.
schema.statics.findByCredentials = async (email, password) => {
  // Search for a user by email and password.
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error({ error: "Invalid login credentials" });
  }
  const isMatched = password === user.password;
  if (!isMatched) {
    throw new Error({ error: "Invalid login credentials" });
  }
  return user;
};

module.exports = User;
