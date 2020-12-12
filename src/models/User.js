const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const recipeSchema = require('./Recipe');
const ingredientSchema = require('./Ingredient');
const preferenceSchema = require('./Preferences');

const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '',
  },
  preferences: {
    type: {},
    ref: 'Preferences',
    default: {
      vegan: false,
      vegetarian: false,
      dairyFree: false,
      glutenFree: false,
      keepMeSignedIn: false,
      intolerables: [],
      metric: false,
    },
  },
  username: {
    type: String,
    default: '',
  },
  inventory: {
    type: [Number],
    ref: 'Ingredients',
    default: null,
  },
  recipe: {
    type: [String],
    ref: 'Recipes',
    default: null,
  },
  resetLink: {
    type: String,
    default: '',
  },
  recentRecipes: {
    type: [String],
    ref: 'Recipes',
    default: null,
  },
  allIngredients: {
    type: [{}],
    ref: 'Ingredient',
    default: null,
  },
  savedRecipes: {
    type: [{}],
    ref: 'Recipes',
    default: null,
  },
});

// Before save happens
// Use function instead of af so that it refers to an individual user and not this file.
userSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function (candidatePassword) {
  const user = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
      if (err) {
        return reject(err);
      }

      if (!isMatch) {
        return reject(false);
      }

      resolve(true);
    });
  });
};

mongoose.model('User', userSchema);
