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
    const { recipes } = req.body;
    req.user.recipe = recipes;
    req.user.save();
    return res.json({ message: 'Success recipe added' });
  } catch (e) {
    console.log(e);
    return res.json({ message: 'Error saved recipe cannot be updated' });
  }
});

/**
 * update preferences - change from true to false or vice versa
 */
router.post('/preferences', requireAuth, async (req, res) => {
  try {
    const { preference } = req.body;
    req.user.preferences = preference;
    req.user.save();
    return res.json({ message: 'Success preference added' });
  } catch (e) {
    console.log(e);
    return res.json({ message: 'Error preferences cannot be updated' });
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
 * view user's recent recipe list
 */
router.get('/recentRecipe', requireAuth, async (req, res) => {
  try {
    res.send(req.user.recentRecipes);
  } catch (e) {
    console.log(e);
    return res.json({ message: 'Error recent recipes cannot be viewed' });
  }
});

/**
 * view most popular recipes list
 */
router.get('/popularRecipes', requireAuth, async (req, res) => {
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

// // Returns the actual ingredient given the ingredient's object id.
// async function getIngredient(objectID) {
//   const client = new MongoClient(mongoUri);
//   try {
//     await client.connect();

//     const result = await client
//       .db('<dbname>')
//       .collection('ingredients')
//       .findOne((elem) => elem === objectID);
//     return result;
//   } catch (e) {
//     console.error(e);
//   } finally {
//     await client.close();
//   }
// }
// // Returns a score of how well a user's inventory matches with a recipe.
// function matchIngredients(recipeIngredients, inventory) {
//   let i = 0;
//   let count = 0;
//   for (i = 0; i < inventory.length; i += 1) {
//     if (recipeIngredients.includes(getIngredient(inventory[i]))) {
//       count += 1;
//     }
//   }
//   return count / inventory.length;
// }

// router.get('/possiblerecipes', requireAuth, async (req, res) => {
//   // Get the ingredients from the object id
//   // take the ingredients from the user's inventory and match it with a given recipe which will return a score
//   // Add the scores to a list once the list is filled. Sort it and return the top 20.
//   console.log(req.user.inventory);
//   const returnRecipes = {};
//   const client = new MongoClient(mongoUri);

//   const cursor = await client
//     .db('<dbname>')
//     .collection('recipes')
//     .find()
//     .limit(30);
//   const temp = await cursor.toArray();
//   temp.array.forEach((element) => {
//     const score = matchIngredients(
//       element.extendedIngredients,
//       req.user.inventory,
//     );
//     if (score in returnRecipes) {
//       returnRecipes[score].push(element);
//     } else {
//       returnRecipes[score] = [element];
//     }
//   });
//   const result = [];
//   const scores = Object.keys(returnRecipes).array.sort();
//   let num = 0;
//   while (result.length < 20) {
//     let i = 0;
//     for (i = 0; i < returnRecipes[scores[num]].length; i += 1) {
//       result.push(returnRecipes[scores[num]][i]);
//     }
//     num += 1;
//   }
//   res.send(req.user.inventory);
// });

module.exports = router;
