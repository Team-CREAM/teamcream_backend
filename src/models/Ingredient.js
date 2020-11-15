const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  id: {
    // unique: true,
    type: Number,
  },
  name: {
    type: String,
  },
  localizedName: {
    type: String,
  },
  image: {
    type: String,
  },
  category: {
    type: String,
  },
});

mongoose.model('Ingredient', ingredientSchema);

module.exports = ingredientSchema;
