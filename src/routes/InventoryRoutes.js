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
 * Returns the actual ingredient given the ingredient's id.
 */
async function getIngredient(id) {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();

    const result = await client
      .db('<dbname>')
      .collection('tempIngredients')
      .findOne({ id });
    return result;
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

/**
 * Returns the actual ingredient given the ingredient's id.
 */
async function getIngredientByName(name) {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();

    const result = await client
      .db('<dbname>')
      .collection('tempIngredients')
      .findOne({ name });
    return result;
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

/**
 * Returns the actual recipe given the recipe's object id.
 */
async function getRecipe(id) {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();

    const result = await client
      .db('<dbname>')
      .collection('recipes')
      .findOne({ id });
    return result;
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

/**
 * Add recipe to user's recent recipe attribute
 */
async function addRecentRecipe(user, recipe) {
  if (user.recentRecipes.includes(recipe)) {
    const index = user.recentRecipes.indexOf(recipe);
    user.recentRecipes.splice(index, 1);
  }
  if (user.recentRecipes.length > 20) {
    user.recentRecipes.splice(19, 1);
  }
  user.recentRecipes.splice(0, 0, recipe);
  user.save();
}

/**
 * Returns the number of ingredients user currently has in their inventory that are used in the recipe
 */
function getIngredientsInRecipe(user, recipeObj) {
  const ingredList = [];
  recipeObj.extendedIngredients.forEach((element) => {
    ingredList.push(element.id);
  });

  const numIng = ingredList.filter((value) => user.inventory.includes(value))
    .length;
  return numIng;
}

/**
 * update the inventory with new ingredients
 */
async function inventoryUpdate(ingredients, user) {
  const ingObjs = [];
  const newInventory = [];
  let i;
  for (i = 0; i < ingredients.length; i++) {
    const ingObj = await getIngredientByName(ingredients[i]);
    newInventory.push(await ingObj.id);
    ingObjs.push(await ingObj);
  }
  user.inventory = await newInventory;
  await user.save();
  return Promise.all(ingObjs);
}

/**
 * update the inventory with new ingredients
 */
async function viewInventory(user) {
  const ingObjs = [];
  let i;
  for (i = 0; i < user.inventory.length; i++) {
    const ingObj = await getIngredient(user.inventory[i]);
    ingObjs.push(await ingObj);
  }
  return Promise.all(ingObjs);
}

/**
 * change the number of likes on a recipe
 */

async function changeLikes(id, add) {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();

    const Recipe = await client.db('<dbname>').collection('recipes');
    let result;
    if (add) {
      result = await Recipe.updateOne({ id }, { $inc: { aggregateLikes: 1 } });
    } else {
      result = await Recipe.updateOne({ id }, { $inc: { aggregateLikes: -1 } });
    }
    return result;
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

/**
 * view inventory
 */
router.get('/inventory', requireAuth, async (req, res) => {
  try {
    console.log(req.user.inventory);
    return res.send(await viewInventory(req.user));
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
    res.send(await inventoryUpdate(ingredients, req.user));
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
    let i;
    const result = [];
    for (i = 0; i < req.user.recipe.length; i++) {
      const newObj = {};
      const recipe = await getRecipe(req.user.recipe[i]);
      newObj.id = recipe._id;
      newObj.title = recipe.title;
      newObj.imageUrl = recipe.image;
      newObj.count = getIngredientsInRecipe(req.user, recipe);
      result.push(newObj);
    }
    return res.send(result);
  } catch (e) {
    console.log(e);
    return res.json({ message: 'Error savedRecipes cannot be viewed' });
  }
});

/**
 * update saved recipes - add, delete
 */
router.post('/savedRecipes', requireAuth, async (req, res) => {
  try {
    const { recipe, add } = req.body;
    await changeLikes(recipe, add);
    if (add) {
      if (req.user.recipe.includes(recipe)) {
        const index = req.user.recipe.indexOf(recipe);
        req.user.recipe.splice(index, 1);
      }
      req.user.recipe.push(recipe);
    } else {
      const index = req.user.recipe.indexOf(
        req.user.recipe.find((elem) => elem === recipe),
      );
      req.user.recipe.splice(index, 1);
    }
    await req.user.save();
    let i;
    const result = [];
    for (i = 0; i < req.user.recipe.length; i++) {
      const newObj = {};
      newObj.recipe = req.user.recipe[i];
      newObj.count = getIngredientsInRecipe(
        req.user,
        await getRecipe(req.user.recipe[i]),
      );
      result.push(newObj);
    }
    if (add) {
      return res.json({ message: 'Success recipe added', result });
    }
    return res.json({ message: 'Success recipe removed', result });
  } catch (e) {
    console.log(e);
    return res.json({ message: 'Error saved recipe cannot be updated' });
  }
});

/**
 * Given recipe objID returns entire recipe object,
 * adds to user's recent recipes attrib, returns
 * number of ingredients user currently has needed for recipe
 */
router.post('/recipeClicked', requireAuth, async (req, res) => {
  try {
    const { recipe } = req.body;
    await addRecentRecipe(req.user, recipe);
    const recipeObj = await getRecipe(recipe);
    const numIng = getIngredientsInRecipe(req.user, recipeObj);
    let saved = false;
    if (req.user.recipe.includes(recipe)) {
      saved = true;
    }
    return res.send({
      Recipe: recipeObj,
      Ingredients: numIng,
      saved,
    });
  } catch (e) {
    console.log(e);
    res.json({ message: 'error' });
  }
});

/**
 * view all ingredients from database
 */
router.get('/allIngredients', requireAuth, async (req, res) => {
  const client = new MongoClient(mongoUri);
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    const cursor = await client
      .db('<dbname>')
      .collection('tempIngredients')
      .find();
    const result = await cursor.toArray();
    return res.send(result);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
});

/**
 * view all recipes from database
 */
router.get('/allRecipes', requireAuth, async (req, res) => {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const cursor = await client.db('<dbname>').collection('recipes').find();
    const result = await cursor.toArray();
    return res.send(result);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
});

module.exports = router;
