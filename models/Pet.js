const mongoose = require('../db/conn');
const { Schema } = mongoose;

const Pet = mongoose.model(
  'Pet',
  new Schema(
    {
      type: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      age: {
        type: Number,
        required: true,
      },
      weight: {
        type: Number,
        required: true,
      },
      height: {
        type: Number,
        required: true,
      },
      color: {
        type: String,
        required: true,
      },
      breed: {
        type: String,
        required: true,
      },
      hypoallergenic: {
        type: String,
      },
      dietaryRestrictions: {
        type: String,
      },
      bio: {
        type: String,
      },
      images: {
        type: Array,
        required: true,
      },
      available: {
        type: Boolean,
        required: true,
      },
      user: Object,
      adopter: Object,
    },
    { timestamps: true }
  )
);

module.exports = Pet;
