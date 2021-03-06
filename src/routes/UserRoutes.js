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
  try {
    res.send(req.user);
  } catch (e) {
    console.log(e);
    res.send({ message: 'Error profile unable to be viewed' });
  }
});

/**
 * update icon - add, change icon
 */
router.post('/icon', requireAuth, async (req, res) => {
  try {
    const { icon } = req.body;
    if (icon !== undefined) {
      req.user.icon = icon;
      req.user.save();
    }
    return res.json({ icon: req.user.icon });
  } catch (e) {
    console.log(e);
    res.send({ message: 'Error icon update failed' });
  }
});

/**
 * update username - add, change username
 */
router.post('/username', requireAuth, async (req, res) => {
  try {
    const { username } = req.body;
    req.user.username = username;
    req.user.save();
    return res.json({ message: 'Success username changed' });
  } catch (e) {
    console.log(e);
    res.send({ message: 'Error username update failed' });
  }
});

/**
 * update preferences - change from true to false or vice versa
 */
router.post('/preferences', requireAuth, async (req, res) => {
  try {
    const { preferences } = req.body;
    req.user.preferences = preferences;
    req.user.save();
    return res.json({ message: 'Success preference added' });
  } catch (e) {
    console.log(e);
    return res.json({ message: 'Error preferences cannot be updated' });
  }
});

/**
 * delete user
 */
router.delete('/delete', requireAuth, async (req, res) => {
  try {
    req.user.remove();
    return res.json({ message: 'User Deleted' });
  } catch (e) {
    console.log(e);
    res.send({ message: 'Error user unable to be deleted' });
  }
});

module.exports = router;
