
const express = require('express')
const router = express.Router()

const playlistController = require('../controllers/playlist.controller')
const authMiddleware = require('../middlewares/auth.middlewares')

// Create a playlist
router.post(
    '/',
    authMiddleware.authUser,
    playlistController.createPlaylist
)

// Get logged-in user's playlists
router.get(
    '/my',
    authMiddleware.authUser,
    playlistController.getMyPlaylists
)

// Add a song to a playlist
router.post(
    '/:playlistId/songs',
    authMiddleware.authUser,
    playlistController.addSongToPlaylist
)

// Remove a song from a playlist
router.delete(
    '/:playlistId/songs/:songId',
    authMiddleware.authUser,
    playlistController.removeSongFromPlaylist
)

// Delete a playlist
router.delete(
    '/:playlistId',
    authMiddleware.authUser,
    playlistController.deletePlaylist
)

module.exports = router
