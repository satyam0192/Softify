const mongoose = require('mongoose')

async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("DB Connected!")
    }
    catch(err){
        console.error("DB connection unsuccessful:", err.message);
    }
}

module.exports = connectDB