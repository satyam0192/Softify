
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Navbar from '../components/Navbar'

const API_URL = 'http://localhost:3000/api'

function ArtistDashboard() {
    const [songs, setSongs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchSongs() {
            try {
                const response = await fetch(
                    `${API_URL}/music/my-songs`,
                    { credentials: 'include' }
                )

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch songs')
                }

                setSongs(data.songs || [])
            } catch (err) {
                setError(err.message || 'Something went wrong')
            } finally {
                setLoading(false)
            }
        }

        fetchSongs()
    }, [])

    const pending = songs.filter(song => song.status === 'pending').length
    const approved = songs.filter(song => song.status === 'approved').length
    const rejected = songs.filter(song => song.status === 'rejected').length

    return (
        <main className="music-page">
            <Navbar />

            <section className="artist-dashboard">
                <div className="dashboard-heading">
                    <div>
                        <p className="eyebrow">ARTIST STUDIO</p>
                        <h1>Your Music Dashboard</h1>
                        <p>Manage your music and track your submissions.</p>
                    </div>

                    <Link to="/artist/upload" className="upload-button">
                        + Upload New Song
                    </Link>
                    <Link to="/artist/profile" className="upload-button">
                        Edit Profile
                    </Link>
                </div>

                <div className="artist-stats">
                    <div className="artist-stat">
                        <span>Total Songs</span>
                        <h2>{songs.length}</h2>
                    </div>

                    <div className="artist-stat">
                        <span>Pending</span>
                        <h2>{pending}</h2>
                    </div>

                    <div className="artist-stat">
                        <span>Approved</span>
                        <h2>{approved}</h2>
                    </div>

                    <div className="artist-stat">
                        <span>Rejected</span>
                        <h2>{rejected}</h2>
                    </div>
                </div>

                <div className="dashboard-section-heading">
                    <h2>My Music</h2>
                    <Link to="/artist/my-songs">View All →</Link>
                </div>

                {loading && <p>Loading your music...</p>}
                {error && <p className="music-error">{error}</p>}

                {!loading && !error && songs.length === 0 && (
                    <div className="empty-music">
                        <h3>Your music journey starts here</h3>
                        <p>You haven't uploaded any songs yet.</p>
                        <Link to="/artist/upload" className="upload-button">
                            Upload Your First Song
                        </Link>
                    </div>
                )}

                <div className="songs-grid">
                    {songs.slice(0, 6).map(song => (
                        <article className="song-card" key={song.id}>
                            <img
                                src={song.coverImage || '/placeholder.png'}
                                alt={song.title}
                            />

                            <h3>{song.title}</h3>
                            <p>{song.genre || 'Other'}</p>

                            <span className={`song-status status-${song.status}`}>
                                {song.status}
                            </span>

                            {song.status === 'rejected' && song.reviewNote && (
                                <p>Review note: {song.reviewNote}</p>
                            )}

                            {song.status === 'approved' && song.uri && (
                                <audio controls preload="none" src={song.uri} />
                            )}
                        </article>
                    ))}
                </div>

                <div className="dashboard-actions">
                    <Link to="/artist/my-songs">Manage My Songs →</Link>
                    <Link to="/artist/upload">Upload Another Song →</Link>
                </div>
            </section>
        </main>
    )
}

export default ArtistDashboard
