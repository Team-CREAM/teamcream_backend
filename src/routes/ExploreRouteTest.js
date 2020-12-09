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

async function filterInventoryOn(user, body, Recipes) {
  const {
    search,
    filter,
    inventory,
    healthy,
    cheap,
    popular,
    sustainable,
  } = body;
  let cursor;
  if (search === '') {
    cursor = await Recipes.find({
      $and: [
        { IngredientList: { $not: { $elemMatch: { $nin: user.inventory } } } },
        { vegan: { $in: [user.preferences.vegan, true] } },
        { vegetarian: { $in: [user.preferences.vegetarian, true] } },
        { dairyFree: { $in: [user.preferences.dairyFree, true] } },
        { glutenFree: { $in: [user.preferences.glutenFree, true] } },
        { IngredientList: { $nin: user.preferences.intolerables } },

        { veryHealthy: { $in: [healthy, true] } },
        { cheap: { $in: [cheap, true] } },
        { veryPopular: { $in: [popular, true] } },
        { sustainable: { $in: [sustainable, true] } },
      ],
    }).limit(200);
  } else {
    cursor = await Recipes.find({
      $and: [
        { IngredientList: { $not: { $elemMatch: { $nin: user.inventory } } } },
        { $text: { $search: search } },

        { vegan: { $in: [user.preferences.vegan, true] } },
        { vegetarian: { $in: [user.preferences.vegetarian, true] } },
        { dairyFree: { $in: [user.preferences.dairyFree, true] } },
        { glutenFree: { $in: [user.preferences.glutenFree, true] } },
        { IngredientList: { $nin: user.preferences.intolerables } },

        { veryHealthy: { $in: [healthy, true] } },
        { cheap: { $in: [cheap, true] } },
        { veryPopular: { $in: [popular, true] } },
        { sustainable: { $in: [sustainable, true] } },
      ],
    }).limit(200);
  }
  const result = await cursor.toArray();
  return result;
}

async function filterOn(user, body, Recipes) {
  const {
    search,
    filter,
    inventory,
    healthy,
    cheap,
    popular,
    sustainable,
  } = body;
  let cursor;
  if (search === '') {
    cursor = await Recipes.find({
      $and: [
        { vegan: { $in: [user.preferences.vegan, true] } },
        { vegetarian: { $in: [user.preferences.vegetarian, true] } },
        { dairyFree: { $in: [user.preferences.dairyFree, true] } },
        { glutenFree: { $in: [user.preferences.glutenFree, true] } },
        { IngredientList: { $nin: user.preferences.intolerables } },

        { veryHealthy: { $in: [healthy, true] } },
        { cheap: { $in: [cheap, true] } },
        { veryPopular: { $in: [popular, true] } },
        { sustainable: { $in: [sustainable, true] } },
      ],
    }).limit(200);
  } else {
    cursor = await Recipes.find({
      $and: [
        { $text: { $search: search } },

        { vegan: { $in: [user.preferences.vegan, true] } },
        { vegetarian: { $in: [user.preferences.vegetarian, true] } },
        { dairyFree: { $in: [user.preferences.dairyFree, true] } },
        { glutenFree: { $in: [user.preferences.glutenFree, true] } },
        { IngredientList: { $nin: user.preferences.intolerables } },

        { veryHealthy: { $in: [healthy, true] } },
        { cheap: { $in: [cheap, true] } },
        { veryPopular: { $in: [popular, true] } },
        { sustainable: { $in: [sustainable, true] } },
      ],
    }).limit(200);
  }
  const result = await cursor.toArray();
  return result;
}

/**
 * creates explore recipe page where filters all recipes based off of params
 */
router.post('/explore2', requireAuth, async (req, res) => {
  const {
    search,
    filter,
    inventory,
    healthy,
    cheap,
    popular,
    sustainable,
  } = req.body;
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const Recipes = await client.db('<dbname>').collection('tempRecipes');
    Recipes.createIndex({ title: 'text' });
    let result = null;
    if (inventory) {
      result = await filterInventoryOn(req.user, req.body, Recipes);
    } else {
      result = await filterOn(req.user, req.body, Recipes);
    }
    return res.send(result);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
});

module.exports = router;
