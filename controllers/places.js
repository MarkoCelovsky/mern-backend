const { validationResult } = require("express-validator");
const HttpError = require("../model/http-error");
const getCoordsFromAddress = require("../util/location");
const Place = require("../model/place");
const User = require("../model/user");
const mongoose = require("mongoose");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    const err = new HttpError(error, 500);
    return next(err);
  }

  if (!place) {
    const err = new HttpError("Could not find a place!", 404);
    return next(err);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getUserPlaces = async (req, res, next) => {
  const userId = req.params.uid;
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(userId).populate("places");
  } catch (error) {
    const err = new HttpError("User with this id does not exist.", 500);
    return next(err);
  }

  if (!userWithPlaces) {
    return next(
      new HttpError("Could not find any places for specified user!", 404)
    );
  }

  res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new HttpError(
      "Invalid inputs provided, please check your data again.",
      422
    );
    return next(err);
  }

  const placeId = req.params.pid;
  const { title, description } = req.body;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    const err = new HttpError("Could not find place to update.", 500);
    return next(err);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    const err = new HttpError(error, 500);
    return next(err);
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (error) {
    const err = new HttpError("Could not find a place to delete", 500);
    return next(err);
  }
  if (!place) {
    return next(new HttpError("Could not find a place for that id.", 404));
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await place.remove({ session });
    place.creator.places.pull(place);
    await place.creator.save({ session });
    await session.commitTransaction();
  } catch (error) {
    const err = new HttpError("Could not find a place to delete", 500);
    return next(err);
  }
  res.status(200).json({ message: "Deleted place!" });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        "Invalid inputs provided, please check your data again.",
        422
      )
    );
  }
  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsFromAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    location: coordinates,
    address,
    image:
      "https://images.pexels.com/photos/12656607/pexels-photo-12656607.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (error) {
    const err = new HttpError("Creating place failed, please try again", 500);
    return next(err);
  }

  if (!user) {
    return next(new HttpError("Could not find user for provided id.", 404));
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdPlace.save({ session });
    user.places.push(createdPlace);
    await user.save({ session });
    await session.commitTransaction();
  } catch (error) {
    const err = new HttpError(error, 500);
    return next(err);
  }

  res.status(201).json({ place: createdPlace });
};

exports.getPlaceById = getPlaceById;
exports.getUserPlaces = getUserPlaces;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
exports.createPlace = createPlace;
