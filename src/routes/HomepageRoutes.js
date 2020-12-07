const express = require('express');
require('dotenv').config();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const { json } = require('body-parser');
const { MongoClient } = require('mongodb');
// eslint-disable-next-line prefer-destructuring
const ObjectID = require('mongodb').ObjectID;
const requireAuth = require('../middlewares/requireAuth');

const mongoUri =
  'mongodb+srv://cse110:gary@cwc.l4ds3.mongodb.net/<dbname>?retryWrites=true&w=majority';
const router = express.Router();

/**
 * return user profile (look at user schema for what will be returned)
 */
router.get('/profile', requireAuth, async (req, res) => {
  res.send(req.user);
});

/**
 * Returns the actual recipe given the recipe's object id.
 */
async function getRecipe(objectID) {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();

    const result = await client
      .db('<dbname>')
      .collection('recipes')
      .findOne({ _id: new ObjectID(objectID) });
    return result;
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

async function getRecentRecipes(user) {
  try {
    const temp = user.recentRecipes;
    const result = await temp.map(async (elem) => {
      const recipeObj = await getRecipe(elem);
      if (user.recipe.includes(elem)) {
        return { recipe: recipeObj, saved: true };
      }
      return { recipe: recipeObj, saved: false };
    });
    return await Promise.all(result);
  } catch (e) {
    console.log(e);
    return JSON.parse({ message: 'Error recent recipes cannot be viewed' });
  }
}

async function getPopularRecipes(user) {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const cursor = await client
      .db('<dbname>')
      .collection('recipes')
      .aggregate([
        {
          $match: {
            $and: [
              { vegan: { $in: [user.preferences.vegan, true] } },
              { vegetarian: { $in: [user.preferences.vegetarian, true] } },
              { dairyFree: { $in: [user.preferences.dairyFree, true] } },
              { glutenFree: { $in: [user.preferences.glutenFree, true] } },
              { IngredientList: { $nin: user.preferences.intolerables } },
            ],
          },
        },
        { $sort: { aggregateLikes: -1 } },
        { $sample: { size: 50 } },
      ]);
    const temp = await cursor.toArray();
    const result = [];
    temp.forEach((elem) => {
      if (user.recipe.includes(elem._id)) {
        result.push({ recipe: getRecipe, saved: true });
      } else {
        result.push({ recipe: elem, saved: false });
      }
    });
    return result;
  } catch (e) {
    console.error(e);
    return JSON.parse({ message: 'Error popular recipes cannot be viewed' });
  } finally {
    await client.close();
  }
}

async function getRandomRecipes(user) {
  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    const Recipe = await client.db('<dbname>').collection('recipes');
    const cursor = await Recipe.aggregate([
      {
        $match: {
          $and: [
            { vegan: { $in: [user.preferences.vegan, true] } },
            { vegetarian: { $in: [user.preferences.vegetarian, true] } },
            { dairyFree: { $in: [user.preferences.dairyFree, true] } },
            { glutenFree: { $in: [user.preferences.glutenFree, true] } },
            { IngredientList: { $nin: user.preferences.intolerables } },
          ],
        },
      },
      { $sample: { size: 50 } },
    ]);
    const temp = await cursor.toArray();
    const result = [];
    temp.forEach((elem) => {
      if (user.recipe.includes(elem._id)) {
        result.push({ recipe: getRecipe, saved: true });
      } else {
        result.push({ recipe: elem, saved: false });
      }
    });
    return result;
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
    const temp = await cursor.toArray();
    const result = [];
    temp.forEach((elem) => {
      if (user.recipe.includes(elem._id)) {
        result.push({ recipe: elem, saved: true });
      } else {
        result.push({ recipe: elem, saved: false });
      }
    });
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
    popular_recipes: await getPopularRecipes(req.user),
    recent_recipes: await getRecentRecipes(req.user),
    random_recipes: await getRandomRecipes(req.user),
    possible_recipes: await getPossibleRecipes(req.user),
  });
});

/**
 * view most popular recipes list
 */
router.get('/popularRecipes', requireAuth, async (req, res) => {
  res.send(await getPopularRecipes(req.user));
});

/**
 * view user's recent recipe list
 */
router.get('/recentRecipes', requireAuth, async (req, res) => {
  res.send(await getRecentRecipes(req.user));
});

/**
 * "Welcome Back" section. Returns 20 random recipes from the data base
 */
router.get('/randomRecipes', requireAuth, async (req, res) => {
  res.send(await getRandomRecipes(req.user));
});

/**
 * Returns recipes depending on the user's ingredient inventory.
 */
router.get('/possiblerecipes', requireAuth, async (req, res) => {
  res.send(await getPossibleRecipes(req.user));
});

module.exports = router;
