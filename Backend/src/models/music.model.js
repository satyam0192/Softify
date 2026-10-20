const mongoose = require('mongoose')

const musicSchema = new mongoose.Schema({
    uri : {
        type : String,
        required : true
    },

    title :{
        type : String,
        required : true
    },

    artist : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    
    coverImage: {
        type: String,
        default: ""
    },

    genre: {
        type: String,
        trim: true,
        default: "Other"
    },

    description: {
        type: String,
        trim: true,
        maxlength: [500, "Description cannot exceed 500 characters"],
        default: ""
    },

    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },

    reviewNote: {
        type: String,
        trim: true,
        default: ""
    },

    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: null
    }
})

const musicModel = mongoose.model("music", musicSchema);

module.exports = musicModel