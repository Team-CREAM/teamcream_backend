const express = require('express');
require('dotenv').config();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { json } = require('body-parser');

const User = mongoose.model('User');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = new User({ email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, 'GARY_IS_LOVE');
    res.send({ token });
  } catch (error) {
    res.send({ error: 'Your email or password is incorrect' });
    // res.send(error.message);
  }
});
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ error: 'Email and password required to login' });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({ error: 'Invalid pasword or email' });
  }
  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, 'GARY_IS_LOVE');
    res.send({ token });
  } catch (error) {
    return res.json({ error: 'Invalid pasword or email' });
  }
});
router.put('/forgotpassword', async (req, res) => {
  const { email } = req.body;
  await User.findOne({ email }, (err, user) => {
    if (!user || err) {
      return res.json({ error: 'User with this email does not exist' });
    }
    const token = jwt.sign({ userId: user._id }, 'GARY_IS_LOVE', {
      expiresIn: '60m',
    });
    user.updateOne({ resetLink: token }, (err, success) => {
      if (err) {
        return res.json({ error: 'User with this email does not exist' });
      }
      console.log('reset link saved to database');
      return res.json({ success: token });
    });
    const mailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'teamZcream@gmail.com',
        pass: 'cookingwithcrumbs',
      },
    });

    const mailDetails = {
      from: 'teamZcream@gmail.com',
      to: email,
      subject: 'reset pass link',
      text: `Here is the reset password link http://localhost:3000/resetpassword?token=${token}`,
    };

    mailTransporter.sendMail(mailDetails, (err, data) => {
      if (err) {
        console.log('Error Occurs');
      } else {
        console.log('Email sent successfully');
      }
    });
  });
});
router.get('/resetpassword', async (req, res) => {
  // console.log(req.query.token);
  res.send(
    '<!DOCTYPE html>\n<html>\n    <head>\n    </head>\n <body>\n      <h1>Hello World!</h1>\n   </body>\n</html>',
  );
});

router.post('/resetpassword', async (req, res) => {
  const { token, newPassword } = req.body;
  jwt.verify(token, 'GARY_IS_LOVE', async (err, data) => {
    if (err) {
<<<<<<< HEAD
      return res.json({ err: 'Incorrect or expired token' });
    }
    await User.findOne({ resetLink: token }, (err, user) => {
      if (err) {
        return res.json({ err: 'User does not exist' });
=======
      return res.status(400).json({ err: 'Incorrect or expired token' });
    }
    await User.findOne({ resetLink: token }, (err, user) => {
      if (err) {
        return res.status(400).json({ err: 'User does not exist' });
>>>>>>> a3ac6c2c9b1e64799152a56c974ef3fa7b6caf04
      }
      // console.log(newPassword);
      // user.updateOne({ password: newPassword, resetLink: '' });
      user.password = newPassword;
      user.resetLink = '';
      user.save();
    });
  });
  return res.json({ message: 'Success reset' });
});

module.exports = router;
