
const artistModel = require('../models/artist.model');
const userModel = require('../models/user.model');
const { uploadFile } = require('../services/storage.services');
const jwt = require('jsonwebtoken');

async function createArtistProfile(req, res) {
    try {
        const { artistName, bio, genre } = req.body;

        // Step 1: Validate artist name
        if (!artistName || !artistName.trim()) {
            return res.status(400).json({
                message: "Artist name is required"
            });
        }

        // Step 2: Find the logged-in user
        const user = await userModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Step 3: Check if profile already exists
        let profile = await artistModel.findOne({
            user: user._id
        });

        // Step 4: Upload profile image if provided
        let profileImage = profile?.profileImage || "";

        if (req.file) {
            const result = await uploadFile(
                req.file.buffer.toString('base64')
            );

            profileImage = result.url;
        }

        // Step 5: Create or update artist profile
        if (profile) {
            profile.artistName = artistName.trim();
            profile.bio = bio || "";
            profile.genre = genre || "Other";
            profile.profileImage = profileImage;

            await profile.save();
        } else {
            profile = await artistModel.create({
                user: user._id,
                artistName: artistName.trim(),
                bio: bio || "",
                genre: genre || "Other",
                profileImage
            });
        }

        // Step 6: Update the user's role
        user.role = "artist";
        await user.save();

        // Step 7: Generate a new token with updated role
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
            message: "Artist profile created successfully",
            artist: {
                id: profile._id,
                artistName: profile.artistName,
                bio: profile.bio,
                genre: profile.genre,
                profileImage: profile.profileImage
            },
            role: user.role
        });

    } catch (error) {
        console.error("Artist profile error:", error.message);

        return res.status(500).json({
            message: "Failed to create artist profile"
        });
    }
}


async function getMyArtistProfile(req, res) {
    try {
        const profile = await artistModel
            .findOne({ user: req.user.id })
            .populate('user', 'username');

        if (!profile) {
            return res.status(404).json({
                message: 'Artist profile not found'
            });
        }

        return res.status(200).json({
            message: 'Artist profile fetched successfully',
            artist: {
                id: profile._id,
                artistName: profile.artistName,
                bio: profile.bio,
                genre: profile.genre,
                profileImage: profile.profileImage,
                username: profile.user?.username
            }
        });

    } catch (error) {
        console.error('Get my artist profile error:', error.message);

        return res.status(500).json({
            message: 'Failed to fetch artist profile'
        });
    }
}


async function getAllArtists(req, res) {
    try {
        const artists = await artistModel
            .find()
            .populate('user', 'username')
            .select('artistName bio genre profileImage user');

        return res.status(200).json({
            message: "Artists fetched successfully",
            artists
        });
    } catch (error) {
        console.error("Get artists error:", error.message);

        return res.status(500).json({
            message: "Failed to fetch artists"
        });
    }
}


async function getArtistById(req, res) {
    try {
        const { artistId } = req.params;

        const artist = await artistModel
            .findById(artistId)
            .populate('user', 'username');

        if (!artist) {
            return res.status(404).json({
                message: 'Artist not found'
            });
        }

        const Music = require('../models/music.model');

        const songs = await Music.find({
            artist: artist.user._id,
            status: 'approved'
        }).select('title uri coverImage genre description');

        return res.status(200).json({
            message: 'Artist details fetched successfully',
            artist,
            songs
        });

    } catch (error) {
        console.error('Artist details error:', error.message);

        return res.status(500).json({
            message: 'Failed to fetch artist details'
        });
    }
}

module.exports = { createArtistProfile , getAllArtists, getArtistById, getMyArtistProfile};
