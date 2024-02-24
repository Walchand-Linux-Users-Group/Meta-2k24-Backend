const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return /^[a-zA-Z\s]*$/.test(value);
            },
            message: 'Invalid name'
        }
    },
    phone: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return /^\d{10}$/.test(value);
            },
            message: 'Invalid phone number'
        },
        unique: true,

    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
            },
            message: 'Invalid email'
        },
        unique: true
    },
    college: {
        type: String,
        required: true
    },
    yearOfStudy: {
        type: String,
        required: true
    },
    isDualBooted: {
        type: Boolean,
        default: false
    },
    techOpted: {
        type: String,
        enum: ['both', 'golang', 'docker'] // Assuming 'both', 'software', 'hardware' are the options
    },
    paymentScreenshot: {
        type: String,
        required: true
    },
    referralCode: {
        type: String,
        required: false
    }
});

const userModel = mongoose.model('Student', studentSchema);

module.exports = userModel;
