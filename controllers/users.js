const { v4: uuid } = require("uuid");
const { validationResult } = require("express-validator");
const HttpError = require("../model/http-error");

const USERS = [
  {
    id: "u1",
    name: "Marko Witt",
    email: "some@email.com",
    password: "password",
    places: 3,
  },
  {
    id: "u2",
    name: "Abu Dhabi",
    email: "some@email-again.com",
    password: "password",
    places: 2,
  },
];

const getUsers = (req, res, next) => {
  res.json({ users: USERS });
};

const signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError(
      "Could not create account, data have incorrect format",
      422
    );
  }
  const { name, email, password } = req.body;

  const userExists = USERS.find((u) => u.email === email);

  if (userExists) {
    throw new HttpError("Could not create user, email already exists", 422);
  }

  const createdUser = {
    id: uuid(),
    name,
    email,
    password,
    places: 0,
  };

  USERS.push(createdUser);
  res.status(201).json({ user: createdUser });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const identifiedUser = USERS.find((u) => u.email === email);

  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError(
      "Could not identify user, credentials seem to be wrong."
    );
  }
  res.json({ message: "Logged in!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
