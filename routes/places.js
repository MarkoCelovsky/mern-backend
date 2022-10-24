const { Router } = require("express");
const { check } = require("express-validator");

const placesController = require("../controllers/places");

const router = Router();

router.get("/user/:uid", placesController.getUserPlaces);

router.get("/:pid", placesController.getPlaceById);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placesController.updatePlace
);

router.delete("/:pid", placesController.deletePlace);

router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placesController.createPlace
);

module.exports = router;
