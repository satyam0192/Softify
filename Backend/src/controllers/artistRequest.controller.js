
const ArtistRequest = require('../models/artistRequest.model')
const userModel = require('../models/user.model')

async function applyForArtist(req, res) {
  try {
    const { artistName, bio } = req.body

    if (
      typeof artistName !== 'string' ||
      typeof bio !== 'string' ||
      !artistName.trim() ||
      !bio.trim()
    ) {
      return res.status(400).json({
        message: 'Artist name and bio are required',
      })
    }

    if (artistName.trim().length > 50 || bio.trim().length > 500) {
      return res.status(400).json({
        message: 'Artist name or bio is too long',
      })
    }

    const user = await userModel.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.role !== 'user') {
      return res.status(403).json({
        message: 'Only normal users can apply to become artists',
      })
    }

    const existing = await ArtistRequest.findOne({ user: user._id })

    if (existing) {
      return res.status(409).json({
        message: 'You have already submitted an artist request',
        request: existing,
      })
    }

    const request = await ArtistRequest.create({
      user: user._id,
      artistName: artistName.trim(),
      bio: bio.trim(),
    })

    return res.status(201).json({
      message: 'Artist application submitted successfully',
      request,
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'An artist request already exists for this account',
      })
    }

    console.error('Artist application error:', error)

    return res.status(500).json({
      message: 'Unable to submit artist application',
    })
  }
}

async function getMyArtistRequest(req, res) {
  try {
    const request = await ArtistRequest.findOne({
      user: req.user.id,
    })

    return res.status(200).json({ request })
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to fetch artist request',
    })
  }
}

async function getPendingRequests(req, res) {
  try {
    const requests = await ArtistRequest.find({ status: 'pending' })
      .populate('user', 'username email')
      .sort({ createdAt: 1 })

    return res.status(200).json({ requests })
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to fetch artist requests',
    })
  }
}

async function reviewArtistRequest(req, res) {
  try {
    const { action } = req.body

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        message: 'Action must be approve or reject',
      })
    }

    const request = await ArtistRequest.findById(req.params.requestId)

    if (!request) {
      return res.status(404).json({
        message: 'Artist request not found',
      })
    }

    if (request.status !== 'pending') {
      return res.status(409).json({
        message: 'This request has already been reviewed',
      })
    }

    const applicant = await userModel.findById(request.user)

    if (!applicant) {
      return res.status(404).json({
        message: 'Applicant account not found',
      })
    }

    if (action === 'approve') {
      if (applicant.role !== 'user') {
        return res.status(409).json({
          message: 'Only normal users can be approved as artists',
        })
      }

      applicant.role = 'artist'
      await applicant.save()
      request.status = 'approved'
    } else {
      request.status = 'rejected'
    }

    request.reviewedAt = new Date()
    await request.save()

    return res.status(200).json({
      message:
        action === 'approve'
          ? 'Artist request approved'
          : 'Artist request rejected',
      request,
    })
  } catch (error) {
    console.error('Review artist request error:', error)

    return res.status(500).json({
      message: 'Unable to review artist request',
    })
  }
}

module.exports = {
  applyForArtist,
  getMyArtistRequest,
  getPendingRequests,
  reviewArtistRequest,
}
