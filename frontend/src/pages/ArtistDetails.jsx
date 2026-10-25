
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import Navbar from '../components/Navbar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function ArtistDetails() {
    const { artistId } = useParams()
    const [artist, setArtist] = useState(null)
    const [songs, setSongs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchArtist() {
            try {
                const response = await fetch(
                    `${API_URL}/artists/${artistId}`
                )
                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch artist')
                }

                setArtist(data.artist)
                setSongs(data.songs || [])
            } catch (err) {
                setError(err.message || 'Something went wrong')
            } finally {
                setLoading(false)
            }
        }

        fetchArtist()
    }, [artistId])

    if (loading) {
        return <main className="music-page"><Navbar /><p>Loading artist...</p></main>
    }

    if (error || !artist) {
        return (
            <main className="music-page">
                <Navbar />
                <p>{error || 'Artist not found'}</p>
                <Link to="/artists">← Back to Artists</Link>
            </main>
        )
    }

    return (
        <main className="music-page">
            

            <section className="artist-hero">
                <img
                    src={artist.profileImage || '/placeholder.png'}
                    alt={artist.artistName}
                    className="artist-detail-image"
                />

                <div>
                    <p>SOFTIFY ARTIST</p>
                    <h1>{artist.artistName}</h1>
                    <p>@{artist.user?.username || 'unknown'}</p>
                    <p>{artist.genre}</p>
                    <p>{artist.bio || 'No bio available'}</p>
                </div>
            </section>

            <section className="songs-section">
                <h2>Popular Songs</h2>

                {songs.length === 0 && (
                    <p>No approved songs available yet.</p>
                )}

                <div className="songs-grid">
                    {songs.map(song => (
                        <article className="song-card" key={song._id}>
                            <img
                                src={song.coverImage || '/placeholder.png'}
                                alt={song.title}
                            />

                            <h3>{song.title}</h3>
                            <p>{song.genre || 'Other'}</p>

                            {song.uri && (
                                <audio
                                    controls
                                    preload="none"
                                    src={song.uri}
                                >
                                    Your browser does not support audio playback.
                                </audio>
                            )}
                        </article>
                    ))}
                </div>

                <p style={{ marginTop: 24 }}>
                    <Link to="/artists">← Back to Artists</Link>
                </p>
            </section>
        </main>
    )
}

export default ArtistDetails
