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
  let result;
  let cursor;
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
          $or: [{ verHealthy: healthy }, { veryHealthy: true }],
        },
        {
          $or: [{ cheap }, { popular: true }],
        },
        {
          $or: [{ veryPopular: popular }, { veryPopular: true }],
        },
        {
          $or: [{ sustainable }, { sustainable: true }],
        },
      ],
    }).limit(200);
  } else {
    cursor = await Recipes.find({
      $and: [
        { $text: { $search: search } },
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
          $or: [{ verHealthy: healthy }, { veryHealthy: true }],
        },
        {
          $or: [{ cheap }, { popular: true }],
        },
        {
          $or: [{ veryPopular: popular }, { veryPopular: true }],
        },
        {
          $or: [{ sustainable }, { sustainable: true }],
        },
      ],
    }).limit(200);
  }
  result = await cursor.toArray();
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
    cursor = await Recipes.find({
      $and: [
        {
          $or: [{ verHealthy: healthy }, { veryHealthy: true }],
        },
        {
          $or: [{ cheap }, { popular: true }],
        },
        {
          $or: [{ veryPopular: popular }, { veryPopular: true }],
        },
        {
          $or: [{ sustainable }, { sustainable: true }],
        },
      ],
    }).limit(200);
  } else {
    cursor = await Recipes.find({
      $and: [
        { $text: { $search: search } },
        {
          $or: [{ verHealthy: healthy }, { veryHealthy: true }],
        },
        {
          $or: [{ cheap }, { popular: true }],
        },
        {
          $or: [{ veryPopular: popular }, { veryPopular: true }],
        },
        {
          $or: [{ sustainable }, { sustainable: true }],
        },
      ],
    }).limit(200);
  }
  result = await cursor.toArray();
  return result;
}

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

module.exports = router;
