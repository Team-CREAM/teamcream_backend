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
 * return user profile (look at user schema for what will be returned)
 */
router.get('/profile', requireAuth, async (req, res) => {
  console.log(req.user.preferences);
  res.send(req.user);
});

module.exports = router;
