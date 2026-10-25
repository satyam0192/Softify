const dns = require("dns");


dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require('express')
const cors = require('cors');
const cookieParser = require('cookie-parser')
const app = express();
const authRoutes = require('./routes/auth.routes')
const musicRoutes = require('./routes/music.routes')
const artistRoutes = require('./routes/artist.routes');
const adminRoutes = require('./routes/admin.routes');
const playlistRoutes = require('./routes/playlist.routes')
const artistRequestRoutes = require('./routes/artistRequest.routes')


const allowedOrigins = [
    'http://localhost:5173',
    'https://softify-three.vercel.app',
    'https://softify-git-main-satyam0192.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.error('Blocked by CORS:', origin);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes)
app.use('/api/music', musicRoutes)
app.use('/api/artists', artistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/playlists', playlistRoutes)
app.use('/api/artist-requests', artistRequestRoutes)

app.use((err, req, res, next) => {
    console.error("Error:", err.message);

    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            message: "File size must not exceed 20 MB"
        });
    }

    if (err.message.includes("Only MP3, WAV and M4A")) {
        return res.status(400).json({
            message: err.message
        });
    }

    if (err.message.includes("Cover image must be an image")) {
        return res.status(400).json({
            message: err.message
        });
    }

    if (err.message.includes("Unexpected file field")) {
        return res.status(400).json({
            message: err.message
        });
    }

    return res.status(500).json({
        message: "Internal server error"
    });
});


module.exports = app;