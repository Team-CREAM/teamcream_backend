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

/**
 * view inventory
 */
router.get('/inventory', requireAuth, async (req, res) => {
  try {
    return res.send(req.user.inventory);
  } catch (e) {
    console.log(e);
    return res.json({ message: 'Error inventory cannot be viewed' });
  }
});

/**
 * update inventory - add, delete
 */
router.post('/inventory', requireAuth, async (req, res) => {
  try {
    const { ingredients } = req.body;
    req.user.inventory = ingredients;
    req.user.save();
    return res.json({ message: 'Success inventory updated' });
  } catch (e) {
    console.log(e);
    return res.json({ message: 'Error inventory cannot be updated' });
  }
});

/**
 * view saved recipes
 */
router.get('/savedRecipes', requireAuth, async (req, res) => {
  try {
    return res.send(req.user.recipe);
  } catch (e) {
    console.log(e);
    return res.json({ message: 'Error inventory cannot be viewed' });
  }
});

/**
 * update saved recipes - add, delete
 */
router.post('/recipe', requireAuth, async (req, res) => {
  try {
    const { recipe, add } = req.body;
    if (add) {
      req.user.recipe.push(recipe);
    } else {
      const index = req.user.recipe.find((elem) => elem.id === recipe.id);
      req.user.splice(index, 1);
    }
    req.user.save();
    return res.json({ message: 'Success recipe added' });
  } catch (e) {
    console.log(e);
    return res.json({ message: 'Error saved recipe cannot be updated' });
  }
});

/**
 * add recipe to user's recent recipe list
 */
router.post('/recentRecipe', requireAuth, async (req, res) => {
  const { recipe } = req.body;
  if (req.user.recentRecipes.includes(recipe)) {
    const index = req.user.recentRecipes.indexOf(recipe);
    req.user.recentRecipes.splice(index, 1);
  }
  if (req.user.recentRecipes.length > 20) {
    req.user.recentRecipes.splice(19, 1);
  }
  req.user.recentRecipes.splice(0, 0, recipe);
  req.user.save();

  return res.json({ message: 'Success recent recipe added' });
});

/**
 * view all ingredients from database
 */
router.get('/allIngredients', requireAuth, async (req, res) => {
  const client = new MongoClient(mongoUri);
  try {
    // Connect to the MongoDB cluster
    await client.connect();

    const cursor = await client.db('<dbname>').collection('ingredients').find();
    const result = await cursor.toArray();
    return res.send(result);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
});

// Returns the actual ingredient given the ingredient's object id.
async function getIngredient(id) {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();

    const result = await client
      .db('<dbname>')
      .collection('ingredients')
      .findOne({ id });
    return result;
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

router.get('/testIng', requireAuth, async (req, res) => {
  res.send(await getIngredient(19165));
});

module.exports = router;
