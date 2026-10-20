const express = require('express')
const musicController = require('../controllers/music.controller')
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middlewares/auth.middlewares')
const Song = require('../models/music.model')

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024 // 20 MB per file
    },
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'music') {
            const allowedAudioTypes = [
                'audio/mpeg',       // MP3
                'audio/wav',        // WAV
                'audio/x-wav',
                'audio/mp4',        // M4A (some clients)
                'audio/x-m4a'
            ];

            if (allowedAudioTypes.includes(file.mimetype)) {
                return cb(null, true);
            }

            return cb(
                new Error('Only MP3, WAV and M4A audio files are allowed')
            );
        }

        if (file.fieldname === 'coverImage') {
            if (file.mimetype.startsWith('image/')) {
                return cb(null, true);
            }

            return cb(new Error('Cover image must be an image file'));
        }

        return cb(new Error('Unexpected file field'));
    }
});


router.post(
    '/upload',
    authMiddleware.authMiddleware,
    upload.fields([
        { name: 'music', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 }
    ]),
    musicController.createMusic
);

router.get(
    '/my-songs',
    authMiddleware.authMiddleware,
    musicController.getMySongs
);

router.get('/', authMiddleware.authUser, musicController.getAllMusic)

router.post('/album', authMiddleware.authMiddleware, musicController.createAlbum)

router.get('/album', authMiddleware.authUser, musicController.getAllAlbum)

router.get('/album/:albumId', authMiddleware.authUser, musicController.getAlbumById)


router.delete(
  '/:id',
  authMiddleware.authMiddleware,
  async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({
          message: 'Only admin can delete songs',
        })
      }

      const song = await Song.findByIdAndDelete(req.params.id)

      if (!song) {
        return res.status(404).json({
          message: 'Song not found',
        })
      }

      return res.status(200).json({
        message: 'Song deleted successfully',
      })
    } catch (error) {
      console.error('Delete song error:', error)
      return res.status(500).json({
        message: 'Failed to delete song',
      })
    }
  }
)


module.exports = router