const express = require('express');
require('dotenv').config();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const { json } = require('body-parser');
const requireAuth = require('../middlewares/requireAuth');

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

module.exports = router;
