const mongoose = require('mongoose')
require('dotenv').config();
const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connection Successful");
    }
    catch(error){
        console.log(error);
    }
}

const disconnectDB = async () => {
    try{
        await mongoose.disconnect()
        console.log("Connection Closed");
    }
    catch(error){
        console.log(error);
    }
}

module.exports = { connectDB, disconnectDB}