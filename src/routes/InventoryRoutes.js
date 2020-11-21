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

MongoClient.connect(mongoUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
});
const router = express.Router();

/**
 * update inventory - add, delete
 */
router.post('/inventory', requireAuth, async (req, res) => {
  const { ingredients } = req.body;
  req.user.inventory = ingredients;
  req.user.save();
  return res.json({ message: 'Success inventory updated' });
});

/**
 * update saved recipes - add, delete
 */
router.post('/recipe', requireAuth, async (req, res) => {
  const { recipes } = req.body;
  req.user.recipe = recipes;
  req.user.save();
  return res.json({ message: 'Success recipe added' });
});

/**
 * update preferences - change from true to false or vice versa
 */
router.post('/preferences', requireAuth, async (req, res) => {
  const { preference } = req.body;
  req.user.preferences = preference;
  console.log(req.user.preferences.vegan);
  req.user.save();

  return res.json({ message: 'Success preference added' });
});

router.post('/addRecentRecipe', requireAuth, async (req, res) => {
  const { recipe } = req.body;
  if (req.user.recentRecipes.length > 20) {
    req.user.recentRecipes.splice(19, 1);
  }
  req.user.recentRecipes.push(recipe);
  req.user.save();

  return res.json({ message: 'Success preference added' });
});

router.get('/recentRecipe', requireAuth, async (req, res) => {
  res.send(req.user.recentRecipes);
});

router.get('/recentRecipe', requireAuth, async (req, res) => {
  res.send(req.user.recentRecipes);
});

// router.get('/allIngredients', requireAuth, async (req, res) => {
//   MongoClient.connect(mongoUri, (err, db) => {
//     if (err) throw err;
//     db.db('mydb')
//       .collection('ingredients')
//       .find()
//       .toArray((err, data) => {
//         if (data != null) response.send(data);
//         db.close();
//       });
//   });
// });

module.exports = router;
