const express = require('express');
const newUser = express.Router();
const User = require('../Models/Users');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

newUser.post('/register',[
    body('name').isLength(),
    body('phone').isLength({ min: 10 }),
    body('email').isEmail(),
  ] ,async (req, res)=>{

    const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

    try {
        let dual = false
        if (req.body.isDualBooted === "true") {
          dual = true;
        }
        await User.create({
          name: req.body.name,
          phone: req.body.phone,
          email: req.body.email,
          college: req.body.college,
          yearOfstudy: req.body.yearOfstudy,
          isDualBooted: dual,
          referralCode: req.body.referralCode,
        });
        res.json({ success: true });
      }
      catch (err) {
        console.log(err);
        res.json({ success: false });
      }
})
module.exports = newUser