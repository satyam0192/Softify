
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Navbar from '../components/Navbar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function Playlists() {
    const [playlists, setPlaylists] = useState([])
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    async function fetchPlaylists() {
        try {
            const response = await fetch(`${API_URL}/playlists/my`, {
                credentials: 'include'
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch playlists')
            }

            setPlaylists(data.playlists || [])
            setError('')
        } catch (err) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPlaylists()
    }, [])

    async function handleCreatePlaylist(e) {
        e.preventDefault()
        setError('')
        setMessage('')

        try {
            const response = await fetch(`${API_URL}/playlists`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create playlist')
            }

            setPlaylists(prev => [data.playlist, ...prev])
            setName('')
            setDescription('')
            setMessage('Playlist created successfully!')
        } catch (err) {
            setError(err.message || 'Something went wrong')
        }
    }

    async function handleDeletePlaylist(playlistId) {
        const confirmed = window.confirm('Delete this playlist?')
        if (!confirmed) return

        setError('')
        setMessage('')

        try {
            const response = await fetch(
                `${API_URL}/playlists/${playlistId}`,
                {
                    method: 'DELETE',
                    credentials: 'include'
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete playlist')
            }

            setPlaylists(prev =>
                prev.filter(playlist => playlist._id !== playlistId)
            )

            setMessage('Playlist deleted successfully!')
        } catch (err) {
            setError(err.message || 'Something went wrong')
        }
    }

    return (
        <main className="music-page">
            

            <section className="playlists-page">
                <p className="eyebrow">YOUR LIBRARY</p>
                <h1>Your Playlists</h1>
                <p className="playlist-subtitle">
                    Create your own collections of music.
                </p>

                <form className="playlist-create-form" onSubmit={handleCreatePlaylist}>
                    <h2>Create a playlist</h2>

                    <input
                        type="text"
                        placeholder="Playlist name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        maxLength={100}
                        required
                    />

                    <textarea
                        placeholder="Description (optional)"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        maxLength={500}
                        rows={3}
                    />

                    <button type="submit">+ Create Playlist</button>
                </form>

                {message && <p className="playlist-success">{message}</p>}
                {error && <p className="music-error">{error}</p>}

                <h2 className="playlist-list-heading">Your collections</h2>

                {loading && <p>Loading playlists...</p>}

                {!loading && !error && playlists.length === 0 && (
                    <p className="playlist-empty">
                        You haven't created any playlists yet.
                    </p>
                )}

                <div className="playlist-grid">
                    {playlists.map(playlist => (
                        <article className="playlist-card" key={playlist._id}>
                            <Link
                                to={`/playlists/${playlist._id}`}
                                className="playlist-card-link"
                            >
                                <div className="playlist-cover">
                                    {playlist.coverImage ? (
                                        <img
                                            src={playlist.coverImage}
                                            alt={playlist.name}
                                        />
                                    ) : (
                                        <span>♫</span>
                                    )}
                                </div>

                                <h3>{playlist.name}</h3>
                                <p>{playlist.description || 'No description'}</p>
                                <span>
                                    {playlist.songs?.length || 0} songs
                                </span>
                            </Link>

                            <button
                                type="button"
                                className="playlist-delete-button"
                                onClick={() => handleDeletePlaylist(playlist._id)}
                            >
                                Delete
                            </button>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    )
}

export default Playlists
