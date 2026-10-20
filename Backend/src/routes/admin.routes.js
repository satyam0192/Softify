
const express = require('express');
const router = express.Router();

const { authAdmin } = require('../middlewares/auth.middlewares');

const {
    getPendingSongs,
    reviewSong
} = require('../controllers/admin.controller');

router.get('/songs/pending', authAdmin, getPendingSongs);

router.patch('/songs/:songId/review', authAdmin, reviewSong);

module.exports = router;
