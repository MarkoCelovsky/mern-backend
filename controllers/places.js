const { v4: uuid } = require("uuid");
const { validationResult } = require("express-validator");
const HttpError = require("../model/http-error");
const getCoordsFromAddress = require("../util/location");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world!",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg",
    address: "20 W 34th St, New York, NY 10001",
    location: {
      lat: 40.7484405,
      lng: -73.9878584,
    },
    creator: "u1",
  },
  {
    id: "p2",
    title: "Capitol of Texas in Austin",
    description: "Capitol of Texas in Austin",
    imageUrl:
      "https://images.pexels.com/photos/3643592/pexels-photo-3643592.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    address: "1100 Congress Ave., Austin, TX 78701",
    location: {
      lat: 30.266666,
      lng: -97.73333,
    },
    creator: "u2",
  },
];

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => p.id === placeId);

  if (!place) {
    throw new HttpError("Could not find a place!", 404);
  }

  res.json({ place });
};

const getUserPlaces = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter((p) => p.creator === userId);

  if (places.length === 0) {
    return next(
      new HttpError("Could not find any places for specified user!", 404)
    );
  }

  res.json({ places });
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new HttpError(
      "Invalid inputs provided, please check your data again."
    );
  }

  const placeId = req.params.pid;
  const { title, description } = req.body;

  const placeIdx = DUMMY_PLACES.findIndex((p) => p.id === placeId);

  const updatedPlace = { ...DUMMY_PLACES[placeIdx], title, description };

  DUMMY_PLACES[placeIdx] = updatedPlace;
  res.status(200).json({ updatedPlace });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
    throw new HttpError("Could not find a place for that id to delete", 404);
  }
  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
  res.status(200).json({ message: "Deleted place!" });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs provided, please check your data again.")
    );
  }
  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsFromAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = {
    id: uuid(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };
  DUMMY_PLACES.push(createdPlace);
  res.status(201).json({ place: createPlace });
};

exports.getPlaceById = getPlaceById;
exports.getUserPlaces = getUserPlaces;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
exports.createPlace = createPlace;
