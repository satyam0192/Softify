
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate, authAdmin } = require('../middlewares/auth.middlewares');
const { createArtistProfile, getAllArtists, getArtistById, getMyArtistProfile } = require('../controllers/artist.controller');
const {
    getPendingSongs,
    reviewSong
} = require('../controllers/admin.controller');


const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

router.post(
    '/profile',
    authenticate,
    upload.single('profileImage'),
    createArtistProfile
)
router.get('/profile/me', authenticate, getMyArtistProfile);
router.patch('/songs/:songId/review', authAdmin, reviewSong);
router.get('/', getAllArtists);
router.get('/:artistId', getArtistById);
module.exports = router;
