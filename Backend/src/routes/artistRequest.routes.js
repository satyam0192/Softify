
const express = require('express')
const { authenticate } = require('../middlewares/auth.middlewares')

const {
  applyForArtist,
  getMyArtistRequest,
  getPendingRequests,
  reviewArtistRequest,
} = require('../controllers/artistRequest.controller')

const router = express.Router()

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      message: 'Admin access required',
    })
  }

  next()
}

// Logged-in user
router.post('/', authenticate, applyForArtist)
router.get('/me', authenticate, getMyArtistRequest)

// Admin only
router.get(
  '/pending',
  authenticate,
  requireAdmin,
  getPendingRequests
)

router.patch(
  '/:requestId/review',
  authenticate,
  requireAdmin,
  reviewArtistRequest
)

module.exports = router
