const express = require('express');
require('dotenv').config();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const { json } = require('body-parser');
const { MongoClient } = require('mongodb');
const requireAuth = require('../middlewares/requireAuth');

const mongoUri =
  'mongodb+srv://cse110:gary@cwc.l4ds3.mongodb.net/<dbname>?retryWrites=true&w=majority';
const router = express.Router();
const Recipe = mongoose.model('Recipe');
const Ingredient = mongoose.model('Ingredient');

/**
 * return user profile (look at user schema for what will be returned)
 */
router.get('/profile', requireAuth, async (req, res) => {
  res.send(req.user);
});

async function getPopularRecipes() {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();

    const cursor = await client
      .db('<dbname>')
      .collection('recipes')
      .find()
      .sort({
        aggregateLikes: -1,
      })
      .limit(30);
    const result = await cursor.toArray();
    return result;
  } catch (e) {
    console.error(e);
    return JSON.parse({ message: 'Error popular recipes cannot be viewed' });
  } finally {
    await client.close();
  }
}

function getRecentRecipes(user) {
  try {
    return user.recentRecipes;
  } catch (e) {
    console.log(e);
    return JSON.parse({ message: 'Error recent recipes cannot be viewed' });
  }
}

async function getRandomRecipes() {
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();

    const Recipe = await client.db('<dbname>').collection('recipes');
    const count = await Recipe.find().count();
    const myRecipes = await Recipe.find()
      .skip(Math.floor(Math.random() * count - 20) + 1) // Start at a certain point in the Collection
      .limit(20); // 20 recipes from the starting point.
    return myRecipes.toArray();
  } catch (e) {
    console.log(e);
    return JSON.parse({ message: 'Error random recipes cannot be viewed' });
  }
}

async function getPossibleRecipes(user) {
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    const Recipe = client.db('<dbname>').collection('recipes');
    const cursor = Recipe.find({
      IngredientList: { $not: { $elemMatch: { $nin: user.inventory } } },
    });
    const result = await cursor.toArray();
    return result;
  } catch (e) {
    console.log(e);
    return JSON.parse({
      message: 'Error what you can make right now cannot be viewed',
    });
  }
}

/**
 * view all homepage items
 */

router.get('/home', requireAuth, async (req, res) => {
  res.send({
    popular_recipes: await getPopularRecipes(),
    recent_recipes: getRecentRecipes(req.user),
    random_recipes: await getRandomRecipes(),
    possible_recipes: await getPossibleRecipes(req.user),
  });
});

/**
 * view most popular recipes list
 */
router.get('/popularRecipes', requireAuth, async (req, res) => {
  res.send(await getPopularRecipes());
});

/**
 * view user's recent recipe list
 */
router.get('/recentRecipes', requireAuth, async (req, res) => {
  res.send(getRecentRecipes(req.user));
});

/**
 * "Welcome Back" section. Returns 20 random recipes from the data base
 */
router.get('/randomRecipes', requireAuth, async (req, res) => {
  res.send(await getRandomRecipes());
});

/**
 * Returns recipes depending on the user's ingredient inventory.
 */
router.get('/possiblerecipes', requireAuth, async (req, res) => {
  res.send(await getPossibleRecipes(req.user));
});

module.exports = router;
