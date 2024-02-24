const express = require('express');
const newEvent = express.Router();
const fs = require('fs');
const dotenv = require('dotenv');
const sendEmail = require('../email');
const cloudinary = require('cloudinary');
const multer = require('multer');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);

const userModel = require('../models/meta');
const { error } = require('console');

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
    secure: true,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

newEvent.post('/register', upload.single('image'), async (req, res) => {

    const currentTime = Math.floor(Date.now() / 1000);

    if (currentTime < process.env.START || currentTime > process.env.END) {
        return res.json({ success: false, message: 'Registration closed' });
    }
    const totalUsers = await userModel.countDocuments();

    if (totalUsers >= process.env.MAX_USERS) {
        return res.json({ success: false, message: 'Registration full.' });
    }

    try {
        
        let imageUrl;
        try {

            if (req.file) {
                console.log('Uploading image:', req.file.originalname);

                // Ensure temp directory exists
                const tempDir = path.join(__dirname, 'temp');
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir);
                }

                // Save buffer to a temporary file
                const tempFilePath = path.join(tempDir, req.file.originalname);

                await writeFileAsync(tempFilePath, req.file.buffer).catch(err => {
                    console.error('Error writing file:', err);
                    throw err;
                });
                console.log('Temporary file created:', tempFilePath);

                const result = await cloudinary.uploader.upload(tempFilePath, { folder: process.env.EVENT + '-' + process.env.YEAR });
                imageUrl = result.secure_url;
                console.log('Image uploaded:', imageUrl);

                fs.unlinkSync(tempFilePath);
            }
        } catch (err) {
            return res.status(500).json({ success: false, error: 'Error uploading image', message: err.message });
        }

        const userObj = {};
        for (const key in req.body) {
            if (key !== 'paymentScreenshot') {
                userObj[key] = req.body[key];
            }
        }
        
        userObj["paymentScreenshot"] = imageUrl;
        console.log(userObj);

        try {
            const newUser = new userModel(userObj);
            await newUser.save();
        }
        catch (err) {
            console.log(err);
            errorCustom = err.message.split(':')[2].trim();
            
            return res.status(500).json({ success: false, error: errorCustom, message: err.message });
        }

        let emailBodyToSend = req.body.techOpted + '.html';
            if (req.body.techOpted === 'both') {
                emailBodyToSend = 'both.html';
            }
            emailPath = path.join(__dirname, '..', 'email-templates', emailBodyToSend);
            
            fs.readFile(emailPath, 'utf-8', (error, htmlContent) => {
                if (error) {
                    console.error(`Error reading email file :`, error.message);
                } else {
                    sendEmail(userObj.email, process.env.EMAIL_SUBJECT, htmlContent);
                    res.json({ success: true, message: userObj.email + ' registered successfully' });
                }
            });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
    }
})



newEvent.get('/totalregistered', async (req, res) => {
    const totalUsers = await userModel.countDocuments();
    res.json({ success: true, count: totalUsers });
})

newEvent.get('/listofusers', async (req, res) => {
    const users = await userModel.find();
    res.json({ success: true, users: users });
})

module.exports = newEvent