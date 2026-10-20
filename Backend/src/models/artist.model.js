
const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        unique: true
    },

    artistName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },

    bio: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ''
    },

    profileImage: {
        type: String,
        default: ''
    },

    coverImage: {
        type: String,
        default: ''
    },

    genre: {
        type: String,
        default: 'Other'
    }
}, {
    timestamps: true
});

const artistModel = mongoose.model('artist', artistSchema);

module.exports = artistModel;
