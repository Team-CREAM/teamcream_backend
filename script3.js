// One Time
require('./src/models/Ingredient');
require('./src/models/Recipe');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');

// Array Remove - By John Resig (MIT Licensed)
// eslint-disable-next-line no-extend-native
Array.prototype.remove = function (from, to) {
  const rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  // eslint-disable-next-line prefer-spread
  return this.push.apply(this, rest);
};

const app = express();

// First get json
app.use(bodyParser.json());

const mongoUri =
  'mongodb+srv://cse110:gary@cwc.l4ds3.mongodb.net/<dbname>?retryWrites=true&w=majority';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
});

mongoose.connection.on('connected', async () => {
  const apikeyssss = [
    '80eadde696c84e4c89ba5a5d363a5da3',
    '8adb4f1b6dd94fed99d306b984e44526',
    'ef85c7547fb8490f97d50f166f553d2e',
    '139e8ef04ce346818b65511a4764ffb1',
    '44906d25a18d499fac608d8f48dabd27',
    '18a0b5f666f44a3694c8a43303d699ff',
    '0a3c80f574c04ff4bccd3dcddff35391',
  ];

  // Get ingredients from database
  const Ingredient = mongoose.model('Ingredient');
  const test = await Ingredient.find({});

  // Push ingredients inside array
  let o;
  const ingredients = [];
  for (o = 0; o < test.length; o++) {
    ingredients.push(test[o].name);
  }
  let i;

  let apiIterator = 0;
  // ingredients.length inside loop                                                       NOTEEEEEEE
  for (i = 700; i < ingredients.length; i++) {
    let offset = 0;
    let res;

    while (offset < 901) {
      try {
        res = await axios.get(
          'https://api.spoonacular.com/recipes/complexSearch',
          {
            headers: { 'Content-Type': 'application/json' },
            params: {
              apiKey: apikeyssss[apiIterator],
              number: 100,
              addRecipeInformation: true,
              fillIngredients: true,
              offset,
              ignorePantry: false,
              query: ingredients[i],
            },
          },
        );
        // Add to database here
        console.log(
          'Apikey ',
          apikeyssss[apiIterator],
          'Query ',
          ingredients[i],
          'Total Results ',
          res.data.totalResults,
          'Offset ',
          offset,
        );

        let k;
        for (k = 0; k < res.data.results.length; k++) {
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
            } = res.data.results[k];
            const Recipe = mongoose.model('Recipe');
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

            await recipe.save();
            console.log('Recipe Added');

            const Ingredient = mongoose.model('Ingredient');
            let m;
            for (m = 0; m < extendedIngredients.length; m++) {
              try {
                const ingredient = new Ingredient(extendedIngredients[m]);
                const cnt = await Ingredient.exists({ id: ingredient.id });
                if (cnt) {
                  console.log('Ingredient Already Exists');
                  continue;
                }
                await ingredient.save();
                console.log('Ingredient Added');
              } catch (err) {
                console.log('Ingredient Failed');
                console.log(err);
              }
            }
          } catch (err) {
            console.log('Recipe failed');
            console.log(err);
          }
        }

        // Iterate to next apikey for next call
        apiIterator += 1;
        if (apiIterator === apikeyssss.length) {
          apiIterator = 0;
        }

        // Check to see if run through same ingredient with different offset.
        if (res.data.totalResults - 100 > offset) {
          offset += 100;
        } else {
          break;
        }
      } catch (err) {
        console.log('Error with apikey');
        // Iterate to next apikey for next call
        apikeyssss.apiIterator += 1;
        if (apiIterator === apikeyssss.length) {
          apiIterator = 0;
        }
        break;
      }
    }
  }
});

mongoose.connection.on('error', (err) => {
  console.log('Error connecting to mongo instance', err);
});
app.listen(3000, () => {
  console.log('Listening on port 3000');
});
