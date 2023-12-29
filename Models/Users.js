const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    college:{
        type:String,
        required:true
    },
    yearOfstudy:{
        type:String,
        required:true
    },
    isDualBooted:{
        type:Boolean,
        required:true
    },
    referralCode:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('User', userSchema)