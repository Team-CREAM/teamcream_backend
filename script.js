// One Time
require('./src/models/Ingredient');
require('./src/models/Recipe');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');

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
  console.log('Connected to mongo instance');
  const apikeyssss = [
    '7c5ca9db5ad4efbffa2deec930f7eed6c20e7c48',
    '8adb4f1b6dd94fed99d306b984e44526',
    'ef85c7547fb8490f97d50f166f553d2e',
    '139e8ef04ce346818b65511a4764ffb1',
    'e23cb649cdba37f349476034b7f6891b7cc3903f',
    '44906d25a18d499fac608d8f48dabd27',
    '039ba75db394a7d9e05b373926c50353475d31a4',
    '18a0b5f666f44a3694c8a43303d699ff',
    '0a3c80f574c04ff4bccd3dcddff35391',
  ];
  let res;
  let i;
  for (i = 0; i < apikeyssss.length; i++) {
    let j;
    for (j = 0; j < 75; j++) {
      try {
        res = await axios.get('https://api.spoonacular.com/recipes/random', {
          headers: { 'Content-Type': 'application/json' },
          params: { apiKey: apikeyssss[i], number: 100 },
        });
      } catch (err) {
        console.log(err);
        break;
      }
      let k;
      for (k = 0; k < res.data.recipes.length; k++) {
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
          } = res.data.recipes[k];

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
    } // end of number of api calls
  } // end of api key
  console.log('done');
});
mongoose.connection.on('error', (err) => {
  console.log('Error connecting to mongo instance', err);
});
app.listen(3000, () => {
  console.log('Listening on port 3000');
});
