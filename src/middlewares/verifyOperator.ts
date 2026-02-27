const mongoose = require("mongoose");
const userSchema = require("../schemas/userSchema");
const User = new mongoose.model("User", userSchema);
// verify admin middleware:
const verifyOperator = async (req, res, next) => {
  const email = req.decoded.email;
  const query = { email };
  const user = await User.findOne(query);
  const isOperator = user.role === "Operator";
  if (!isOperator) {
    return res.status(403).send({ message: "Forbidden access!!!" });
  }
  next();
}

module.exports = verifyOperator;
