require("dotenv").config();
const mongoose = require('mongoose');

module.exports = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('* Database Connected *');
    } catch (error) {
        console.error('Error connecting to database:', error);
    }
};