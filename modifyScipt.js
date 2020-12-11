const express = require('express');
require('dotenv').config();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const { json } = require('body-parser');
const { MongoClient } = require('mongodb');
require('./src/models/Ingredient');

const mongoUri =
  'mongodb+srv://cse110:gary@cwc.l4ds3.mongodb.net/<dbname>?retryWrites=true&w=majority';

async function copyCollection() {
  const client = new MongoClient(mongoUri);
  await client.connect();

  const Recipe = client.db('<dbname>').collection('recipes');
  const allRecipes = await Recipe.find().toArray();

  let i;
  for (i = 0; i < allRecipes.length; i++) {
    const ingredList = [];
    allRecipes[i].extendedIngredients.forEach((element) => {
      ingredList.push(element.id);
    });
    await Recipe.updateOne(
      { _id: allRecipes[i]._id },
      { $set: { IngredientList: ingredList.sort() } },
    );
  }

  await client.close();
  return 'ingredList';
}

async function deleteNoImage() {
  const client = new MongoClient(mongoUri);
  await client.connect();

  const Recipe = client.db('<dbname>').collection('recipes');
  await Recipe.deleteMany({ image: '' });
  await client.close();
  return 'deleted';
}

async function deleteAllUsers() {
  const client = new MongoClient(mongoUri);
  await client.connect();

  const user = client.db('<dbname>').collection('users');
  await user.deleteMany({});
  await client.close();
  return 'deleted users';
}

async function copyIngredients() {
  const client = new MongoClient(mongoUri);
  const Ingredient = mongoose.model('Ingredient');

  await client.connect();

  const Recipe = client.db('<dbname>').collection('recipes');
  const Ingredients = client.db('<dbname>').collection('tempIngredients');

  const allRecipes = await Recipe.find().toArray();

  let i;
  for (i = 0; i < allRecipes.length; i++) {
    const extIngreds = allRecipes[i].extendedIngredients;
    let m;
    for (m = 0; m < extIngreds.length; m++) {
      try {
        const ingredient = new Ingredient(extIngreds[m]);
        const cnt = await Ingredients.find({
          $and: [{ id: ingredient.id }, { name: ingredient.name }],
        }).toArray();
        console.log(cnt);
        if (cnt.length === 0) {
          const check2 = await Ingredients.find({
            $and: [{ id: { $ne: ingredient.id } }, { name: ingredient.name }],
          }).toArray();
          if (check2.length === 0) {
            await Ingredients.insertOne(ingredient);
            console.log('Ingredient Added');
          }
        }
      } catch (err) {
        console.log('Ingredient Failed');
        console.log(err);
      }
    }
  }
  await client.close();
  return 'done';
}

// async function deleteDuplicates() {
//   const client = new MongoClient(mongoUri);
//   await client.connect();

//   const user = client.db('<dbname>').collection('ingredients');
//   const ingredients = [];
//   await user.deleteMany({});
//   await client.close();
//   return 'deleted users';
// }

async function main() {
  // console.log(await copyCollection());
  // console.log(await deleteNoImage());
  // console.log(await deleteAllUsers());
  // await copyIngredients();
}

main();
