const Pet = require('../models/Pet');

//helpers
const getToken = require('../helpers/get-token');
const getUserByToken = require('../helpers/get-user-by-token');
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = class PetController {
  // create a pet
  static async create(req, res) {
    const {
      type,
      name,
      age,
      weight,
      height,
      color,
      breed,
      hypoallergenic,
      dietaryRestrictions,
      bio,
    } = req.body;

    const images = req.files;

    const available = true;

    // validations

    // if (images.length === 0) {
    //   res.status(422).json({ message: 'At least one image is mandatory' });
    //   return;
    // }

    if (!type) {
      res.status(422).json({ message: 'Type is mandatory' });
      return;
    }

    if (!name) {
      res.status(422).json({ message: 'Name is mandatory' });
      return;
    }

    if (!age) {
      res.status(422).json({ message: 'Age is mandatory' });
      return;
    }

    if (!weight) {
      res.status(422).json({ message: 'Weight is mandatory' });
      return;
    }

    if (!height) {
      res.status(422).json({ message: 'Height is mandatory' });
      return;
    }

    if (!color) {
      res.status(422).json({ message: 'Color is mandatory' });
      return;
    }

    if (!breed) {
      res.status(422).json({ message: 'Breed is mandatory' });
      return;
    }

    //get pet owner
    const token = getToken(req);
    const user = await getUserByToken(token);

    // create a pet
    const pet = new Pet({
      type,
      name,
      age,
      weight,
      height,
      color,
      breed,
      hypoallergenic,
      dietaryRestrictions,
      bio,
      images: [],
      available,
      user: {
        _id: user._id,
        name: user.name,
        image: user.image,
        phone: user.phone,
      },
    });

    images.map((image) => {
      pet.images.push(image.filename);
    });

    try {
      const newPet = await pet.save();
      res.status(201).json({
        message: 'Pet created with success',
        newPet,
      });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  // get all registered pets
  static async getAll(req, res) {
    const pets = await Pet.find().sort('-createdAt');

    res.status(200).json({
      pets: pets,
    });
  }

  // get all registered pets
  static async getAllUserPets(req, res) {
    //get user from token
    const token = getToken(req);
    const user = await getUserByToken(token);

    const pets = await Pet.find({ 'user._id': user._id }).sort('-createdAt');

    res.status(200).json({
      pets,
    });
  }

  static async getAllUserAdoptions(req, res) {
    //get user from token
    const token = getToken(req);
    const user = await getUserByToken(token);

    const pets = await Pet.find({ 'adopter._id': user._id }).sort('-createdAt');

    res.status(200).json({
      pets,
    });
  }

  // get a specific pet
  static async getPetById(req, res) {
    const id = req.params.id;

    //check if id exists
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: 'Invalid ID' });
      return;
    }

    //check if pet exists
    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      res
        .status(404)
        .json({ message: 'Something went wrong. Pet did not found' });
      return;
    }

    res.status(200).json({
      pet: pet,
    });
  }

  static async removePetById(req, res) {
    const id = req.params.id;

    //check if id exists
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: 'Invalid ID' });
      return;
    }

    //check if pet exists
    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      res
        .status(404)
        .json({ message: 'Something went wrong. Pet did not found' });
      return;
    }

    //check if logged in user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.toString() !== user._id.toString()) {
      res
        .status(402)
        .json({ message: 'Something went wrong. Try again later' });
      return;
    }

    await Pet.findByIdAndRemove(id);
    res.status(200).json({
      message: 'Pet removed with success',
    });
  }

  //EDIT
  static async updatePet(req, res) {
    const id = req.params.id;
    const {
      type,
      name,
      age,
      weight,
      height,
      color,
      breed,
      hypoallergenic,
      dietaryRestrictions,
      bio,
      available,
    } = req.body;

    const images = req.files;

    const updatedData = {};

    //check if id exists
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: 'Invalid ID' });
      return;
    }

    //check if pet exists
    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      res
        .status(404)
        .json({ message: 'Something went wrong. Pet did not found' });
      return;
    }

    //check if logged in user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.toString() !== user._id.toString()) {
      res
        .status(402)
        .json({ message: 'Something went wrong. Try again later' });
      return;
    }

    // validations
    if (!type) {
      res.status(422).json({ message: 'Type is mandatory' });
      return;
    } else {
      updatedData.type = type;
    }

    if (!name) {
      res.status(422).json({ message: 'Name is mandatory' });
      return;
    } else {
      updatedData.name = name;
    }

    if (!age) {
      res.status(422).json({ message: 'Age is mandatory' });
      return;
    } else {
      updatedData.age = age;
    }

    if (!weight) {
      res.status(422).json({ message: 'Weight is mandatory' });
      return;
    } else {
      updatedData.weight = weight;
    }

    if (!height) {
      res.status(422).json({ message: 'Height is mandatory' });
      return;
    } else {
      updatedData.height = height;
    }

    if (!color) {
      res.status(422).json({ message: 'Color is mandatory' });
      return;
    } else {
      updatedData.color = color;
    }

    if (!breed) {
      res.status(422).json({ message: 'Breed is mandatory' });
      return;
    } else {
      updatedData.breed = breed;
    }

    if (hypoallergenic) {
      updatedData.hypoallergenic = hypoallergenic;
    }

    if (dietaryRestrictions) {
      updatedData.dietaryRestrictions = dietaryRestrictions;
    }

    if (bio) {
      updatedData.bio = bio;
    }

    if (available) {
      updatedData.available = available;
    }

    if (images.lenght > 0) {
      updatedData.images = [];
      images.map((image) => {
        updatedData.images.push(image.filename);
      });
    }

    await Pet.findByIdAndUpdate(id, updatedData);

    res.status(200).json({ pet: pet, message: 'Pet updated with success' });
  }

  static async schedule(req, res) {
    const id = req.params.id;

    //check if pet exists
    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      res
        .status(404)
        .json({ message: 'Something went wrong. Pet did not found' });
      return;
    }

    //check if user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.toString() === user._id.toString()) {
      res
        .status(402)
        .json({ message: 'You can not schedule a visit to your own pet' });
      return;
    }

    //check if user has already schedule a visit
    if (pet.adopter) {
      if (pet.adopter._id.equals(user._id)) {
        res
          .status(402)
          .json({ message: 'You already schedule a visit to this pet' });
        return;
      }
    }

    //add user to pet
    pet.adopter = {
      _id: user._id,
      name: user.name,
      image: user.image,
    };

    await Pet.findByIdAndUpdate(id, pet);
    res.status(200).json({
      message: `Schedule to visit ${pet.name} made with success, contact with ${pet.user.name} - phone ${pet.user.phone}`,
    });
  }

  static async concludeAdoption(req, res) {
    const id = req.params.id;

    //check if pet exists
    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      res
        .status(404)
        .json({ message: 'Something went wrong. Pet did not found' });
      return;
    }

    //check if logged in user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.toString() !== user._id.toString()) {
      res
        .status(402)
        .json({ message: 'Something went wrong. Try again later' });
      return;
    }

    pet.available = false;

    await Pet.findByIdAndUpdate(id, pet);
    res.status(200).json({
      message: `Congratulations! ${pet.name} was adopted! Thank you`,
    });
  }
};
