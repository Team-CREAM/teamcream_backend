// One Time
require('./src/models/Ingredient');
require('./src/models/Recipe');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
const { MongoClient } = require('mongodb');

const app = express();

// First get json
app.use(bodyParser.json());

const mongoUri =
  'mongodb+srv://cse110:gary@cwc.l4ds3.mongodb.net/<dbname>?retryWrites=true&w=majority';

async function addRecipes() {
  const client = new MongoClient(mongoUri);
  await client.connect();

  const tempRecipes = client.db('<dbname>').collection('tempRecipes');
  const allRecipes = await client
    .db('<dbname>')
    .collection('recipes')
    .find()
    .toArray();

  const Recipe = mongoose.model('Recipe');
  console.log('Connected to mongo instance');
  const apikeyssss = [];
  let i;
  for (i = 2705; i < allRecipes.length; i += 1) {
    console.log(i);
    let res;
    try {
      if (allRecipes[i].id === null || allRecipes[i].id === undefined) {
        continue;
      }
      console.log(allRecipes[i].id);
      const url = `https://api.spoonacular.com/recipes/${allRecipes[i].id}/information?includeNutrition=false`;
      res = await axios.get(url, {
        headers: { 'Content-Type': 'application/json' },
        params: { apiKey: apikeyssss[i % apikeyssss.length] },
      });
    } catch (err) {
      console.log(err);
      return;
    }
    try {
      const {
        vegetarian,
        vegan,
        glutenFree,
        dairyFree,
        veryHealthy,
        cheap,
        veryPopular,
        sustainable,
        weightWatcherSmartPoints,
        gaps,
        lowFodMap,
        aggregateLikes,
        spoonacularScore,
        healthScore,
        creditsText,
        license,
        sourceName,
        pricePerServing,
        extendedIngredients,
        id,
        title,
        readyInMinutes,
        servings,
        sourceUrl,
        image,
        imageType,
        summary,
        cuisines,
        dishTypes,
        diets,
        occasions,
        instructions,
        analyzedInstructions,
        originalId,
        spoonacularSourceUrl,
      } = res.data;

      const recipe = new Recipe({
        vegetarian,
        vegan,
        glutenFree,
        dairyFree,
        veryHealthy,
        cheap,
        veryPopular,
        sustainable,
        weightWatcherSmartPoints,
        gaps,
        lowFodMap,
        aggregateLikes,
        spoonacularScore,
        healthScore,
        creditsText,
        license,
        sourceName,
        pricePerServing,
        extendedIngredients,
        id,
        title,
        readyInMinutes,
        servings,
        sourceUrl,
        image,
        imageType,
        summary,
        cuisines,
        dishTypes,
        diets,
        occasions,
        instructions,
        analyzedInstructions,
        originalId,
        spoonacularSourceUrl,
      });
      const check = await tempRecipes.findOne({ title: recipe.title });
      if (check === null) {
        await tempRecipes.insertOne(recipe);
        console.log('Recipe Added');
      } else {
        console.log('Recipe exists');
      }
    } catch (err) {
      console.log('Recipe failed');
      console.log(err);
      return;
    }
  }
  return 'done';
} // end of number of api calls

console.log(addRecipes());
