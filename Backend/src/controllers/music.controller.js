const musicModel = require('../models/music.model')
const albumModel = require('../models/album.model')
const jwt = require('jsonwebtoken')
const {uploadFile} = require('../services/storage.services')


async function createMusic(req, res) {
    try {
        const { title, genre, description } = req.body;

        // Step 1: Validate input
        const audioFile = req.files?.music?.[0];
        const coverFile = req.files?.coverImage?.[0];

        if (!title || !audioFile || !coverFile) {
            return res.status(400).json({
                message: "Title, audio file and cover image are required"
            });
        }

        // Step 2: Upload audio to ImageKit
        const audioResult = await uploadFile(
            audioFile.buffer.toString('base64')
        );

        // Step 3: Upload cover image to ImageKit
        const coverResult = await uploadFile(
            coverFile.buffer.toString('base64')
        );

        // Step 4: Save song in MongoDB
        const music = await musicModel.create({
            uri: audioResult.url,
            coverImage: coverResult.url,
            title,
            genre,
            description,
            artist: req.user.id
            // status automatically becomes "pending"
        });

        // Step 5: Send response
        return res.status(201).json({
            message: "Song uploaded successfully. Waiting for admin approval.",
            music: {
                id: music._id,
                title: music.title,
                uri: music.uri,
                coverImage: music.coverImage,
                genre: music.genre,
                status: music.status
            }
        });

    } catch (error) {
        console.error("Song upload error:", error.message);

        return res.status(500).json({
            message: "Failed to upload song"
        });
    }
}


async function createAlbum (req, res){
    
    const {title, musicId} = req.body;

    const album = await albumModel.create({
        title,
        artist : req.user.id,
        music : musicId

    })

    res.status(201).json({
        message : "album create successfuly",
        music : {
            id : album._id,
            artis : album.artist,
            music : album.music
        }
    })
}

async function getAllMusic (req, res){
    const musics = await musicModel
    .find({status: "approved"})
    .skip(0)
    .limit(10)
    .populate("artist", "username")

    res.status(200).json({
        message : "musics fetched successfuly",
        musics : musics
    })
}


async function getMySongs(req, res) {
    try {
        const songs = await musicModel
            .find({ artist: req.user.id })
            .populate("artist", "username")
            .sort({ _id: -1 });

        
        return res.status(200).json({
            message: "Your songs fetched successfully",
            count: songs.length,
            songs: songs.map(song => ({
            id: song._id,
            title: song.title,
            coverImage: song.coverImage,
            genre: song.genre,
            description: song.description,
            status: song.status,
            reviewNote: song.reviewNote,
            artist: song.artist
                ? song.artist.username
                : "Unknown Artist"
        }))
    });


    } catch (error) {
        console.error("Fetch my songs error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch your songs"
        });
    }
}


async function getAllAlbum(req, res){
    const albums = await albumModel.find().select("title artist").populate("artist", "username email")

    res.status(200).json({
        message : "album fetched successfuly",
        albums : albums
    })
}

async function getAlbumById(req, res){
    const albumId = req.params.albumId

    if(!albumId){
        return res.status(404).json({
            message : "some error occured"
        })
    }

    const album = await albumModel.findById(albumId).populate("artist", "username email").populate("music")
    res.status(200).json({
        message : "fetched successfuly",
        musics : album
    })
}

module.exports = {
    createMusic,
    createAlbum,
    getAllMusic,
    getAllAlbum,
    getAlbumById,
    getMySongs
}