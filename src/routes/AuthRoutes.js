const express = require('express');
require('dotenv').config();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
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
  console.log(email);
  await User.findOne({ email }, (err, user) => {
    if (!user || err) {
      console.log(user);
      console.log(err);
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
      return res.json({ success: true });
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
  res.sendFile(path.join(`${__dirname}/../reset/index.html`));
});

router.post('/resetpassword', async (req, res) => {
  const { token, newPassword } = req.body;
  jwt.verify(token, 'GARY_IS_LOVE', async (err, data) => {
    if (err) {
      return res.json({ err: 'Incorrect or expired token' });
    }
    await User.findOne({ resetLink: token }, (err, user) => {
      if (!user) {
        return res.json({ err: 'User does not exist' });
      }

      // user.updateOne({ password: newPassword, resetLink: '' });
      user.password = newPassword;
      user.resetLink = '';
      user.save();
      return res.json({ message: 'Success reset' });
    });
  });
});

router.get('/profile', async (req, res) => {
  const { token } = req.body;
  jwt.verify(token, 'GARY_IS_LOVE', async (err, data) => {
    if (err) {
      return res.json({ err: 'Incorrect or expired token' });
    }

    await User.findOne({ _id: data.userId }, (err, user) => {
      if (err) {
        console.log(data);
        return res.json({ err: 'User does not exist' });
      }
      console.log(user);
      res.send(user);
    });
  });
});

router.post('/icon', async (req, res) => {
  const { token, icon } = req.body;

  console.log(icon);
  // console.log(newIcon);
  jwt.verify(token, 'GARY_IS_LOVE', async (err, data) => {
    if (err) {
      return res.json({ err: 'Incorrect or expired token' });
    }
    await User.findOne({ _id: data.userId }, (err, user) => {
      if (err) {
        return res.json({ err: 'User does not exist' });
      }
      user.icon = icon;
      user.save();
    });
  });
  return res.json({ message: 'Success icon changed' });
});

router.post('/username', async (req, res) => {
  const { token, username } = req.body;

  jwt.verify(token, 'GARY_IS_LOVE', async (err, data) => {
    if (err) {
      return res.json({ err: 'Incorrect or expired token' });
    }
    await User.findOne({ _id: data.userId }, (err, user) => {
      if (err) {
        return res.json({ err: 'User does not exist' });
      }
      user.username = username;
      user.save();
    });
  });
  return res.json({ message: 'Success username changed' });
});

router.post('/inventory', async (req, res) => {
  const { token, ingredient } = req.body;
  // console.log(newIcon);
  jwt.verify(token, 'GARY_IS_LOVE', async (err, data) => {
    if (err) {
      return res.json({ err: 'Incorrect or expired token' });
    }
    await User.findOne({ _id: data.userId }, (err, user) => {
      if (err) {
        return res.json({ err: 'User does not exist' });
      }
      user.inventory.push(ingredient);
      user.save();
    });
  });
  return res.json({ message: 'Success ingredient added' });
});

router.post('/recipe', async (req, res) => {
  const { token, recipe } = req.body;
  // console.log(newIcon);
  jwt.verify(token, 'GARY_IS_LOVE', async (err, data) => {
    if (err) {
      return res.json({ err: 'Incorrect or expired token' });
    }
    await User.findOne({ _id: data.userId }, (err, user) => {
      if (err) {
        return res.json({ err: 'User does not exist' });
      }
      user.recipe.push(recipe);
      user.save();
    });
  });
  return res.json({ message: 'Success recipe changed' });
});

router.delete('/delete', async (req, res) => {
  const { token } = req.body;
  jwt.verify(token, 'GARY_IS_LOVE', async (err, data) => {
    if (err) {
      console.log('incorrect token');
      return res.json({ err: 'Incorrect or expired token' });
    }
    await User.findOne({ _id: data.userId }, (err, user) => {
      if (err) {
        console.log('inside err: User doesnt exist');
        return res.json({ err: 'User does not exist' });
      }
      console.log(user);
      user.remove();
    });
  });
  return res.json({ message: 'User Deleted' });
});
module.exports = router;
