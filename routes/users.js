const { Router } = require("express");
const { check } = require("express-validator");
const HttpError = require("../model/http-error");
const usersController = require("../controllers/users");

const router = Router();

router.get("/", usersController.getUsers);

router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 5 }),
  ],
  usersController.signup
);

router.post("/login", usersController.login);

module.exports = router;