const mongoose = require("mongoose");
const userSchema = require("../schemas/userSchema");
const User = new mongoose.model("User", userSchema);
// verify admin middleware:
const verifyAdmin = async (req, res, next) => {
  const email = req.decoded.email;
  const query = { email };
  const user = await User.findOne(query);
  const isAdmin = user.role === "Admin";
  if (!isAdmin) {
    return res.status(403).send({ message: "Forbidden access!!!" });
  }
  next();
}

module.exports = verifyAdmin;
