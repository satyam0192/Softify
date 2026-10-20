
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Navbar from '../components/Navbar'

function Artists() {
    const [artists, setArtists] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchArtists() {
            try {
                const response = await fetch(
                    'http://localhost:3000/api/artists'
                )

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch artists')
                }

                setArtists(data.artists || [])
            } catch (err) {
                setError(err.message || 'Something went wrong')
            } finally {
                setLoading(false)
            }
        }

        fetchArtists()
    }, [])

    return (
        <main className="music-page">
            

            <section className="songs-section">
                <h1>Explore Artists</h1>
                <p>Discover artists and their music on Softify.</p>

                {loading && <p>Loading artists...</p>}
                {error && <p>{error}</p>}

                {!loading && !error && artists.length === 0 && (
                    <p>No artists found yet.</p>
                )}

                <div className="songs-grid">
                    {artists.map(artist => (
                        <article className="song-card" key={artist._id}>
                            <Link
                                to={`/artists/${artist._id}`}
                                style={{
                                    color: 'inherit',
                                    textDecoration: 'none'
                                }}
                            >
                                <img
                                    src={artist.profileImage || '/placeholder.png'}
                                    alt={artist.artistName}
                                />

                                <h3>{artist.artistName}</h3>
                                <p>{artist.genre}</p>
                                <p>{artist.bio || 'No bio available'}</p>
                                <p>
                                    @{artist.user?.username || 'unknown'}
                                </p>

                                <span>View Artist →</span>
                            </Link>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    )
}

export default Artists
