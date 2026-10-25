
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Navbar from '../components/Navbar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function MySongs() {
    const [songs, setSongs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchMySongs() {
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

        fetchMySongs()
    }, [])

    return (
        <main className="music-page">
            <Navbar />

            <section className="songs-section">
                <div className="dashboard-heading">
                    <div>
                        <h1>My Songs</h1>
                        <p>Manage your uploaded music and approval status.</p>
                    </div>

                    <Link to="/artist/upload" className="upload-button">
                        + Upload Song
                    </Link>
                </div>

                {loading && <p>Loading your songs...</p>}
                {error && <p className="music-error">{error}</p>}

                {!loading && !error && songs.length === 0 && (
                    <p>You haven't uploaded any songs yet.</p>
                )}

                <div className="songs-grid">
                    {songs.map(song => (
                        <article className="song-card" key={song.id}>
                            <img
                                src={song.coverImage || '/placeholder.png'}
                                alt={song.title}
                            />

                            <h3>{song.title}</h3>
                            <p>{song.genre || 'Other'}</p>
                            <p>
                                Status: <strong>{song.status}</strong>
                            </p>

                            {song.status === 'rejected' && song.reviewNote && (
                                <p>Review note: {song.reviewNote}</p>
                            )}

                            {song.status === 'approved' && song.uri && (
                                <audio
                                    controls
                                    preload="none"
                                    src={song.uri}
                                />
                            )}
                        </article>
                    ))}
                </div>
            </section>
        </main>
    )
}

export default MySongs
