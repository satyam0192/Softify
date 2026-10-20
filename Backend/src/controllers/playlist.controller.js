
const mongoose = require('mongoose')
const playlistModel = require('../models/playlist.model')
const musicModel = require('../models/music.model')

// Create playlist
async function createPlaylist(req, res) {
    try {
        const { name, description } = req.body

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: 'Playlist name is required'
            })
        }

        const playlist = await playlistModel.create({
            name: name.trim(),
            description: description || '',
            owner: req.user.id
        })

        return res.status(201).json({
            message: 'Playlist created successfully',
            playlist
        })
    } catch (error) {
        console.error('Create playlist error:', error.message)
        return res.status(500).json({
            message: 'Failed to create playlist'
        })
    }
}

// Get logged-in user's playlists

async function getMyPlaylists(req, res) {
    try {
        const playlists = await playlistModel
            .find({ owner: req.user.id })
            .populate({
                path: 'songs',
                select: 'title coverImage genre uri artist',
                populate: {
                    path: 'artist',
                    select: 'username'
                }
            })
            .sort({ createdAt: -1 })

        return res.status(200).json({
            message: 'Playlists fetched successfully',
            count: playlists.length,
            playlists
        })
    } catch (error) {
        console.error('Fetch playlists error:', error.message)

        return res.status(500).json({
            message: 'Failed to fetch playlists'
        })
    }
}


// Add an approved song to a playlist
async function addSongToPlaylist(req, res) {
    try {
        const { playlistId } = req.params
        const { songId } = req.body

        if (
            !mongoose.isValidObjectId(playlistId) ||
            !mongoose.isValidObjectId(songId)
        ) {
            return res.status(400).json({
                message: 'Invalid playlist or song ID'
            })
        }

        const playlist = await playlistModel.findOne({
            _id: playlistId,
            owner: req.user.id
        })

        if (!playlist) {
            return res.status(404).json({
                message: 'Playlist not found'
            })
        }

        const song = await musicModel.findOne({
            _id: songId,
            status: 'approved'
        })

        if (!song) {
            return res.status(404).json({
                message: 'Approved song not found'
            })
        }

        if (playlist.songs.some(id => id.equals(song._id))) {
            return res.status(409).json({
                message: 'Song already exists in this playlist'
            })
        }

        playlist.songs.push(song._id)
        await playlist.save()

        return res.status(200).json({
            message: 'Song added to playlist successfully',
            playlist
        })
    } catch (error) {
        console.error('Add song error:', error.message)
        return res.status(500).json({
            message: 'Failed to add song'
        })
    }
}

// Remove a song from a playlist
async function removeSongFromPlaylist(req, res) {
    try {
        const { playlistId, songId } = req.params

        if (
            !mongoose.isValidObjectId(playlistId) ||
            !mongoose.isValidObjectId(songId)
        ) {
            return res.status(400).json({
                message: 'Invalid playlist or song ID'
            })
        }

        const playlist = await playlistModel.findOne({
            _id: playlistId,
            owner: req.user.id
        })

        if (!playlist) {
            return res.status(404).json({
                message: 'Playlist not found'
            })
        }

        playlist.songs = playlist.songs.filter(
            id => !id.equals(songId)
        )

        await playlist.save()

        return res.status(200).json({
            message: 'Song removed successfully',
            playlist
        })
    } catch (error) {
        console.error('Remove song error:', error.message)
        return res.status(500).json({
            message: 'Failed to remove song'
        })
    }
}

// Delete a playlist
async function deletePlaylist(req, res) {
    try {
        const { playlistId } = req.params

        if (!mongoose.isValidObjectId(playlistId)) {
            return res.status(400).json({
                message: 'Invalid playlist ID'
            })
        }

        const playlist = await playlistModel.findOneAndDelete({
            _id: playlistId,
            owner: req.user.id
        })

        if (!playlist) {
            return res.status(404).json({
                message: 'Playlist not found'
            })
        }

        return res.status(200).json({
            message: 'Playlist deleted successfully'
        })
    } catch (error) {
        console.error('Delete playlist error:', error.message)
        return res.status(500).json({
            message: 'Failed to delete playlist'
        })
    }
}

module.exports = {
    createPlaylist,
    getMyPlaylists,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist
}
