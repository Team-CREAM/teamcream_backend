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
      .collection('ingredients')
      .findOne({ id });
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
  let result = null;
  let cursor = null;
  if (search === '') {
    cursor = await Recipes.find({
      $and: [
        { $or: [{ vegan: user.preferences.vegan }, { vegan: true }] },
        {
          $or: [
            { vegetarian: user.preferences.vegetarian },
            { vegetarian: true },
          ],
        },
        {
          $or: [{ dairyFree: user.preferences.dairyFree }, { dairyFree: true }],
        },
        {
          $or: [
            { glutenFree: user.preferences.glutenFree },
            { glutenFree: true },
          ],
        },
        { IngredientList: { $nin: user.preferences.intolerables } },
        {
          $or: [{ healthy }, { healthy: true }],
        },
        {
          $or: [{ cheap }, { popular: true }],
        },
        {
          $or: [{ popular }, { popular: true }],
        },
        {
          $or: [{ sustainable }, { sustainable: true }],
        },
      ],
    }).limit(200);
  } else {
    cursor = await Recipes.find(
      { $text: { $search: search } },
      {
        $and: [
          { $or: [{ vegan: user.preferences.vegan }, { vegan: true }] },
          {
            $or: [
              { vegetarian: user.preferences.vegetarian },
              { vegetarian: true },
            ],
          },
          {
            $or: [
              { dairyFree: user.preferences.dairyFree },
              { dairyFree: true },
            ],
          },
          {
            $or: [
              { glutenFree: user.preferences.glutenFree },
              { glutenFree: true },
            ],
          },
          { IngredientList: { $nin: user.preferences.intolerables } },
          {
            $or: [{ healthy }, { healthy: true }],
          },
          {
            $or: [{ cheap }, { popular: true }],
          },
          {
            $or: [{ popular }, { popular: true }],
          },
          {
            $or: [{ sustainable }, { sustainable: true }],
          },
        ],
      },
    ).limit(200);
  }
  result = await cursor.toArray();
  if (inventory) {
    const temp = await cursor.find({
      IngredientList: {
        $not: { $elemMatch: { $nin: user.inventory } },
      },
    });
    result = await temp.toArray();
  }
  return result;
}

async function filterOff(user, body, Recipes) {
  const {
    search,
    filter,
    inventory,
    healthy,
    cheap,
    popular,
    sustainable,
  } = body;
  let result;
  let cursor;
  if (search === '') {
    console.log('Search empty');
    cursor = await Recipes.find({
      $and: [
        {
          $or: [{ healthy }, { healthy: true }],
        },
        {
          $or: [{ cheap }, { popular: true }],
        },
        {
          $or: [{ popular }, { popular: true }],
        },
        {
          $or: [{ sustainable }, { sustainable: true }],
        },
      ],
    }).limit(200);
  } else {
    cursor = await Recipes.find(
      { $text: { $search: search } },
      {
        $and: [
          {
            $or: [{ healthy }, { healthy: true }],
          },
          {
            $or: [{ cheap }, { popular: true }],
          },
          {
            $or: [{ popular }, { popular: true }],
          },
          {
            $or: [{ sustainable }, { sustainable: true }],
          },
        ],
      },
    ).limit(200);
  }
  console.log(await cursor.toArray());
  result = await cursor.toArray();
  if (inventory) {
    const temp = await cursor.find({
      IngredientList: {
        $not: { $elemMatch: { $nin: user.inventory } },
      },
    });
    result = await temp.toArray();
  }
  return result;
}
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
    return res.send(result);
  } catch (e) {
    console.log(e);
    return res.json({ message: 'Error inventory cannot be viewed' });
  }
});

/**
 * update saved recipes - add, delete
 */
router.post('/savedRecipes', requireAuth, async (req, res) => {
  try {
    const { recipe, add } = req.body;
    if (add) {
      if (req.user.recipe.includes(recipe)) {
        const index = req.user.recipe.indexOf(recipe);
        req.user.recipe.splice(index, 1);
      }
      req.user.recipe.push(recipe);
    } else {
      console.log(typeof req.user.recipe[0]);
      const index = req.user.recipe.indexOf(
        req.user.recipe.find((elem) => elem === recipe),
      );
      console.log(index);
      req.user.recipe.splice(index, 1);
    }
    req.user.save();
    return res.json({ message: 'Success recipe added' });
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
 * creates explore recipe page where filters all recipes based off of params
 */
router.get('/explore', requireAuth, async (req, res) => {
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
    const Recipes = await client.db('<dbname>').collection('recipes');
    Recipes.createIndex({ title: 'text' });
    let result = null;
    if (filter) {
      result = await filterOn(req.user, req.body, Recipes);
    } else {
      result = await filterOff(req.user, req.body, Recipes);
    }
    return res.send(result);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
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
    const cursor = await client.db('<dbname>').collection('ingredients').find();
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
