const jwt = require("jsonwebtoken");
const { TOKEN_EXPIRATION_TIME } = require("../utils/constants.js");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  // const token = authHeader && authHeader.split(" ")[1];
  const token = authHeader;
  // console.log("token ",token);

  if (token == null)
    return res.status(401).json({ message: "No token provided" });

  try {
    jwt.verify(token, process.env.TOKEN_SECRET || "secretKey", (err, user) => {
      console.log(err);
      if (err) {
        if (err.name == "TokenExpiredError") {
          return res.status(401).json({ message: "Token expired" });
        }
        return res.status(403).json({ message: "Invalid token" });
      }
      req.user = user;
      next();
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Some thing went wrong" });
  }
}

function generateAccessToken(id) {
  console.log("id ", id);
  console.log("process.env.TOKEN_SECRET ", process.env.TOKEN_SECRET);
  console.log("TOKEN_EXPIRATION_TIME ", TOKEN_EXPIRATION_TIME);
  return jwt.sign({ data: id }, process.env.TOKEN_SECRET || "secretKey", {
    expiresIn: TOKEN_EXPIRATION_TIME,
  });
}

module.exports = {
  authenticateToken,
  generateAccessToken,
};
