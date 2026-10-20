
const mongoose = require('mongoose')

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },

    description: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ''
    },

    coverImage: {
        type: String,
        default: ''
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },

    songs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'music'
    }]
}, {
    timestamps: true
})

module.exports = mongoose.model('playlist', playlistSchema)
