const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    username : {
        type: String,
        maxLength : [20, 'username is too long'],
        minLength : [3, 'username is too short'],
        unique : true,
        trim : true,
        required : [true, 'username is required'],
        
    },

    email : {
        type : String,
        required : [true, 'Email is required'],
        unique : true,
        trim : true,
        lowercase : true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email']
    },

    password: {
        type: String,
        required: [true, 'Password is required']
    },
    role : {
        type : String,
        enum : ['user', 'artist', 'admin'],
        default : 'user'
    }

})

const userModel = mongoose.model('user', userSchema);

module.exports = userModel