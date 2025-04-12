const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config();

const createJWT = (body)=> {
  const expiresInTime = 86400;
  const token = jwt.sign(body, process.env.JWT_SECRET, { expiresIn: expiresInTime });
  return token;
};

const verifyJWT = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded;
};

module.exports = {createJWT,verifyJWT}