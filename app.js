const express = require("express");
const mongoose = require("mongoose");
const { mongoDb } = require("./api-key");
const HttpError = require("./model/http-error");

const placesRoutes = require("./routes/places");
const usersRoutes = require("./routes/users");

const app = express();
app.use(express.json());

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  throw new HttpError("Could not find this route.", 404);
});

app.use((err, req, res, next) => {
  if (res.headerSent) {
    return next(err);
  }
  res.status(err.code || 500);
  res.json({ message: err.message || "An unknown error occured." });
});

mongoose
  .connect(mongoDb)
  .then(() => {
    app.listen(8080);
    console.log("Listening on port 8080.");
  })
  .catch((err) => {
    console.error(err);
  });
