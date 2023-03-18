require("dotenv").config();
// //console.log(process.env) // remove this after you've confirmed it working
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const dbConfig = require("./config/db.config");
const auth = require("./middleware/auth.js");
const errors = require("./middleware/errors.js");
const unless = require("express-unless");

// connect to mongodb

/**
 * With useNewUrlParser: The underlying MongoDB driver has deprecated their current connection string parser.
 * Because this is a major change, they added the useNewUrlParser flag to allow users to fall back to the old parser if they find a bug in the new parser.
 * You should set useNewUrlParser: true unless that prevents you from connecting.
 *
 * With useUnifiedTopology, the MongoDB driver sends a heartbeat every heartbeatFrequencyMS to check on the status of the connection.
 * A heartbeat is subject to serverSelectionTimeoutMS , so the MongoDB driver will retry failed heartbeats for up to 30 seconds by default.
 */
const database_url =
  process.env.APPLICATION_ENVIRONEMNET === "production"
    ? process.env.DATABASE_URL_PRODUCTION
    : process.env.DATABASE_URL_DEV;

const database = database_url || dbConfig.db;
mongoose.Promise = global.Promise;


// middleware for authenticating token submitted with requests
/**
 * Conditionally skip a middleware when a condition is met.
 */
auth.authenticateToken.unless = unless;
app.use(cors());
app.use(
  auth.authenticateToken.unless({
    path: [
      { url: "/users/login", methods: ["POST"] },
      { url: "/users/register", methods: ["POST"] },
      { url: /^\/users\/verify\/.*/, methods: ["GET"] },
      { url: /^\/uploads\/.*/, methods: ["GET"] },
      { url: "/users/forget-password", methods: ["POST"] },
      { url: "/users/change-password", methods: ["POST"] },
      { url: "/users/verify-otp", methods: ["POST"] },
      { url: "/", methods: ["GET"] },
    ],
  })
);
app.use(express.json());

// initialize routes
app.get("/", (req, res) => res.send("API Working!!"));
app.use("/uploads", express.static("uploads"));
app.use("/users", require("./routes/users.routes"));
app.use("/reviews", require("./routes/reviews.routes"));
app.use("/shops", require("./routes/shops.routes"));
app.use("/appointments", require("./routes/appointments.routes"));
app.use("/tags", require("./routes/tags.routes"));

// middleware for error responses
app.use(errors.errorHandler);
const PORT = process.env.PORT || 4000;

mongoose
  .connect(database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    () => {
      console.log("Database connected");
      app.listen(PORT, function () {
        console.log("Bablus Backend is live 🚀");
        console.log('You can send requests')
        console.log(`visit http://localhost:${PORT}`);
      });
    },
    (error) => {
      console.log("Database can't be connected: " + error);
    }
  );
// listen for requests


module.exports = app;
