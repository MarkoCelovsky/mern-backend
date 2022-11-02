const { v4: uuid } = require("uuid");
const { validationResult } = require("express-validator");
const HttpError = require("../model/http-error");
const User = require("../model/user");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "email name image places");
  } catch (error) {
    return next(new HttpError("Could not find any users", 500));
  }

  if (!users || users.length === 0) {
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new HttpError(
      "Could not create account, data have incorrect format",
      422
    );
    return next(err);
  }
  const { name, email, password } = req.body;

  let exisitngUser;
  try {
    exisitngUser = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError(
      "Singning up failed, please try again later",
      500
    );
    return next(err);
  }

  if (exisitngUser) {
    const err = new HttpError(
      "User exists already, please login instead.",
      422
    );
    return next(err);
  }

  const createdUser = new User({
    id: uuid(),
    name,
    email,
    image:
      "https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    password,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (error) {
    const err = new HttpError(error, 500);
    return next(err);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let exisitngUser;
  try {
    exisitngUser = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError("Logging in failed, please try again later", 500);
    return next(err);
  }

  if (!exisitngUser || exisitngUser.password !== password) {
    return next(
      new HttpError(
        "Could not log you in, credentials seem to be invalid.",
        401
      )
    );
  }
  res.json({
    message: "Logged in!",
    user: exisitngUser.toObject({ getters: true }),
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
