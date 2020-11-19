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

/**
 * update icon - add, change icon
 */
router.post('/icon', requireAuth, async (req, res) => {
  const { icon } = req.body;
  req.user.icon = icon;
  req.user.save();
  return res.json({ message: 'Success icon changed' });
});

/**
 * update username - add, change username
 */
router.post('/username', requireAuth, async (req, res) => {
  const { username } = req.body;
  req.user.username = username;
  req.user.save();
  return res.json({ message: 'Success username changed' });
});

/**
 * delete user
 */
router.delete('/delete', requireAuth, async (req, res) => {
  req.user.remove();
  return res.json({ message: 'User Deleted' });
});

module.exports = router;
