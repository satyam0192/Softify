
const musicModel = require('../models/music.model');

async function getPendingSongs(req, res) {
    try {
        const songs = await musicModel
            .find({ status: 'pending' })
            .populate('artist', 'username');

        return res.status(200).json({
            message: 'Pending songs fetched successfully',
            count: songs.length,
            songs
        });
    } catch (error) {
        console.error('Fetch pending songs error:', error.message);

        return res.status(500).json({
            message: 'Failed to fetch pending songs'
        });
    }
}


async function reviewSong(req, res) {
    try {
        const { songId } = req.params;
        const { decision, reviewNote } = req.body;

        // 1. Validate admin decision
        if (!['approved', 'rejected'].includes(decision)) {
            return res.status(400).json({
                message: "Decision must be approved or rejected"
            });
        }

        // 2. Find the song
        const song = await musicModel.findById(songId);

        if (!song) {
            return res.status(404).json({
                message: "Song not found"
            });
        }

        // 3. Only review pending songs
        if (song.status !== 'pending') {
            return res.status(409).json({
                message: "This song has already been reviewed"
            });
        }

        // 4. Update review details
        song.status = decision;
        song.reviewNote = reviewNote || "";
        song.reviewedBy = req.user.id;

        await song.save();

        return res.status(200).json({
            message: `Song ${decision} successfully`,
            song: {
                id: song._id,
                title: song.title,
                status: song.status,
                reviewNote: song.reviewNote
            }
        });

    } catch (error) {
        console.error("Review song error:", error.message);

        return res.status(500).json({
            message: "Failed to review song"
        });
    }
}


module.exports = { getPendingSongs, reviewSong };
