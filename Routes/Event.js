const express = require('express');
const newEvent = express.Router();
const fs = require('fs');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../db')
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const sendEmail = require('../email');
const cloudinary = require('cloudinary');
const multer = require('multer');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);



const generateDynamicSchema = (fields) => {
    const dynamicSchema = {};

    for (const key in fields) {

        const fieldValue = fields[key];

        if (fieldValue === -1) continue;

        else if (key === 'phone') {
            dynamicSchema[key] = {
                type: String,
                required: (fieldValue === 1),
                validate: {
                    validator: function (value) {
                        return /^\d{10}$/.test(value);
                    },
                    message: 'Invalid phone number'
                },
                unique: true
            };
        }

        else if (key === 'isDualBooted') {
            dynamicSchema[key] = {
                type: Boolean,
                required: (fieldValue === 1),
            };
        }

        else if (key === 'email') {
            dynamicSchema[key] = {
                type: String,
                required: (fieldValue === 1),
                validate: {
                    validator: function (value) {
                        return /\S+@\S+\.\S+/.test(value);
                    },
                    message: 'Invalid email address'
                },
                unique: true
            };
        }
        else dynamicSchema[key] = {
            type: String,
            required: (fieldValue === 1),
        };

    }
    return mongoose.Schema(dynamicSchema);
};


function init() {
    const result = dotenv.config({ path: '.env' });
    console.log('Initializing event:', process.env.EVENT);

    cloudinary.v2.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET,
        secure: true,
    });

    let fields = {
        name: process.env.NAME,
        phone: process.env.PHONE,
        email: process.env.EMAIL,
        college: process.env.COLLEGE,
        yearOfStudy: process.env.YEAROFSTUDY,
        isDualBooted: process.env.ISDUALBOOTED,
        techOpted: process.env.TECHOPTED,
        paymentScreenshot: process.env.PAYMENTSCREENSHOT,
        referralCode: process.env.REFERRALCODE,
    };


    let eventModel
    if (result.error) {
        console.error('Error loading .env file:', result.error);
    } else {
        console.log('.env file loaded successfully!');
        try {
            const modelName = `${process.env.EVENT}-${process.env.YEAR}`;
            connectDB();
            const dynamicSchema = generateDynamicSchema(fields);
            eventModel = mongoose.model(modelName, dynamicSchema);
        }
        catch (err) {
            console.log(err);
            eventModel = null;
        }
    }
    return { eventModel, fields };
}

var { eventModel, fields } = init();


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

newEvent.post('/register', upload.single('image'), async (req, res) => {

    if (eventModel === null) {
        return res.json({ success: false, message: 'Event not created yet' });
    }

    const currentTime = Math.floor(Date.now() / 1000);

    if (currentTime < process.env.START || currentTime > process.env.END) {
        return res.json({ success: false, message: 'Registration closed' });
    }

    const totalUsers = await eventModel.countDocuments();

    if (totalUsers >= process.env.MAX_USERS) {
        return res.json({ success: false, message: 'Registration full.' });
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {

        let imageUrl;

        try {

            if (req.file) {
                console.log('Uploading image:', req.file.originalname);
                console.log('path:', req.file);

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


                // Delete temporary file
                fs.unlinkSync(tempFilePath);
            }
        } catch (err) {
            console.error('Error uploading image:', err);
            return res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
        }


        const userObj = {};
        for (const key in fields) {
            const fieldValue = fields[key];

            if (fieldValue !== -1 && key !== 'paymentScreenshot') {
                userObj[key] = req.body[key];
            }
        }
        userObj["paymentScreenshot"] = imageUrl;

        console.log(userObj);
        await eventModel.create(userObj);
        let emailBodyToSend = req.body.techOpted + '.html';
        if (req.body.techOpted === 'both') {
            emailBodyToSend = 'both.html';
        }
        emailPath = path.join(__dirname,'..', 'email-templates', emailBodyToSend);
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
        res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
    }
})


newEvent.get('/totalregistered', async (req, res) => {
    const totalUsers = await eventModel.countDocuments();
    res.json({ success: true, count: totalUsers });
})

newEvent.get('/listofusers', async (req, res) => {
    const users = await eventModel.find();
    res.json({ success: true, users: users });
})


newEvent.post('/schedule', [], (req, res) => {
    const opts = {
        event: req.body.event,
        year: req.body.year,
        start: req.body.start,
        end: req.body.end,
        mongo_uri: req.body.uri,
        email_body: req.body.email_body,
        email_subject: req.body.email_subject,
        max_users: req.body.max_users,
        api_key: req.body.api_key,

        tech1: req.body.tech1,
        tech2: req.body.tech2,

        cloudinary_name: req.body.cloudinary_name,
        cloudinary_key: req.body.cloudinary_key,
        cloudinary_secret: req.body.cloudinary_secret,


        fields: {
            name: req.body.fields.name,
            phone: req.body.fields.phone,
            email: req.body.fields.email,
            college: req.body.fields.college,
            yearOfstudy: req.body.fields.yearOfstudy,
            isDualBooted: req.body.fields.isDualBooted,
            techOpted: req.body.fields.techOpted,
            paymentScreenshot: req.body.fields.paymentScreenshot,
            referralCode: req.body.fields.referralCode,
        },
    }

    try {
        disconnectDB()

        if (opts.start >= opts.end) {
            res.json({ success: false, message: 'Invalid start and end time' });
            return;
        }

        if (opts.max_users <= 0) {
            res.json({ success: false, message: 'Invalid max users' });
            return;
        }

        if (opts.api_key !== "devs@wcewlug") {
            res.json({ success: false, message: 'Invalid API Key' });
            return;
        }

        const modelName = `${opts.event}-${opts.year}`;
        // Check if the model already exists
        if (mongoose.models[modelName]) {
            res.json({ success: false, message: 'Event ' + modelName + ' is already ongoing' });
            return;
        }


        let envContent = Object.keys(opts)
            .filter(key => key !== 'fields' && key !== 'email_body' && key !== 'api_key')
            .map(key => `${key.toUpperCase()}=${opts[key]}`)
            .join('\n');

        for (const key in opts.fields) {
            envContent += `\n${key.toUpperCase()}=${opts.fields[key]}`;
        }

        const fileName = '.env';

        fs.writeFile(fileName, envContent, (err) => {
            if (err) {
                console.error('Error creating file:', err);
                res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
            } else {
                console.log('File created successfully!');
                const result = dotenv.config({ path: '.env' });
                if (result.error) {
                    console.error('Error loading .env file:', result.error);
                } else {
                    console.log('.env file loaded successfully!');
                    ({ eventModel, fields } = init());
                }

                res.json({ success: true, message: 'Event scheduled successfully' });
            }
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
    }
})


module.exports = newEvent