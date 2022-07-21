const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  // const token = authHeader && authHeader.split(" ")[1];
  const token = authHeader;
  // console.log("token ",token);

  if (token == null)
    return res.status(401).json({ message: "No token provided" });

  try {
    jwt.verify(token, "process.env.TOKEN_SECRET", (err, user) => {
      console.log(user);
      if (err) {
        if (err.name == "TokenExpiredError") {
          return res.status(401).json({ message: "Token expired" });
        }
        return res.status(403).json({ message: "Invalid token" });
      }
      // req.user = user;
      // if (user.data == req.body.id)
        next();
      //   else
      //   return res.status(403).json({ message: "Invalid token" });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Some thing went wrong" });
  }
}

function generateAccessToken(username) {
  return jwt.sign({ data: username }, "process.env.TOKEN_SECRET", {
    expiresIn: "5h",
  });
}

module.exports = {
  authenticateToken,
  generateAccessToken,
};
