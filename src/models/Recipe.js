const mongoose = require('mongoose');
const ingredientSchema = require('./Ingredient.js');

const commentSchema = new mongoose.Schema({
  title: {
    type: String,
    default: '',
  },
  summary: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    default: 0,
  },
  id: {
    type: Number,
    // unique: true,
  },
  userId: {
    type: Number,
    default: 0,
  },
  recipeId: {
    type: Number,
    default: 0,
  },
});

const equipmentSchema = new mongoose.Schema({
  id: {
    type: Number,
    // unique: true,
  },
  name: {
    type: String,
    default: '',
  },
  localizedName: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
});

const stepsSchema = new mongoose.Schema({
  number: {
    type: String,
    default: '',
  },
  step: {
    type: String,
    default: '',
  },
  ingredients: {
    type: [ingredientSchema],
    default: null,
  },
  equipment: {
    type: [equipmentSchema],
    default: null,
  },
});

const instructionsSchema = new mongoose.Schema({
  name: {
    type: String,
    default: '',
  },
  steps: {
    type: [stepsSchema],
    default: null,
  },
});

const recipeSchema = new mongoose.Schema({
  vegetarian: {
    type: Boolean,
    default: false,
  },
  vegan: {
    type: Boolean,
    default: false,
  },
  glutenFree: {
    type: Boolean,
    default: false,
  },
  dairyFree: {
    type: Boolean,
    default: false,
  },
  veryHealthy: {
    type: Boolean,
    default: false,
  },
  cheap: {
    type: Boolean,
    default: false,
  },
  veryPopular: {
    type: Boolean,
    default: false,
  },
  sustainable: {
    type: Boolean,
    default: false,
  },
  weightWatcherSmartPoints: {
    type: Number,
    default: false,
  },
  gaps: {
    type: String,
    default: '',
  },
  lowFodmap: {
    type: Boolean,
    default: false,
  },
  aggregateLikes: {
    type: Number,
    default: 0,
  },
  spoonacularScore: {
    type: Number,
    default: 0,
  },
  healthScore: {
    type: Number,
    default: 0,
  },
  creditsText: {
    type: String,
    default: '',
  },
  license: {
    type: String,
    default: '',
  },
  sourceName: {
    type: String,
    default: '',
  },
  pricePerServing: {
    type: Number,
    default: 0,
  },
  extendedIngredients: {
    type: [ingredientSchema],
    default: null,
  },
  id: {
    type: Number,
    unique: true,
  },
  title: {
    type: String,
    default: '',
  },
  readyInMinutes: {
    type: Number,
    default: 0,
  },
  servings: {
    type: Number,
    default: 0,
  },
  sourceUrl: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  imageType: {
    type: String,
    default: '',
  },
  summary: {
    type: String,
    default: '',
  },
  cuisines: {
    type: [String],
    default: null,
  },
  dishTypes: {
    type: [String],
    default: null,
  },
  diets: {
    type: [String],
    default: null,
  },
  occasions: {
    type: [String],
    default: null,
  },
  instructions: {
    type: String,
    default: '',
  },
  analyzedInstructions: {
    type: [instructionsSchema],
    default: null,
  },
  originalId: {
    type: Number,
    default: 0,
  },
  spoonacularSourceUrl: {
    type: String,
    default: '',
  },
  comments: {
    type: [commentSchema],
    default: null,
  },
});

mongoose.model('Recipe', recipeSchema);
module.exports = recipeSchema;
