
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import Navbar from '../components/Navbar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function AlbumDetails() {
  const { albumId } = useParams()
  const [album, setAlbum] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchAlbum() {
      try {
        const response = await fetch(
          `${API_URL}/music/album/${albumId}`,
          { credentials: 'include' }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to fetch album')
        }

        // Existing backend response mein album "musics" key ke andar hai.
        setAlbum(data.musics)
      } catch (err) {
        setError(err.message || 'Unable to load album')
      } finally {
        setLoading(false)
      }
    }

    fetchAlbum()
  }, [albumId])

  if (loading) {
    return <main className="music-page"><p>Loading album...</p></main>
  }

  if (error || !album) {
    return (
      <main className="music-page">
        
        <p className="music-error">{error || 'Album not found'}</p>
        <Link to="/albums">Back to Albums</Link>
      </main>
    )
  }

  // Handle both a single song and an array of songs.
  const songs = Array.isArray(album.music)
    ? album.music
    : album.music
      ? [album.music]
      : []

  return (
    <main className="music-page">
     

      <section className="music-hero">
        <p className="eyebrow">SOFTIFY ALBUM</p>
        <h1>{album.title}</h1>
        <p>By {album.artist?.username || 'Unknown artist'}</p>
        <p>{songs.length} song(s)</p>
      </section>

      <section className="songs-section">
        <h2>Songs in this album</h2>

        {songs.length === 0 && <p>No songs added to this album yet.</p>}

        <div className="songs-grid">
          {songs.map((song) => (
            <article className="song-card" key={song._id}>
              <img
                src={song.coverImage || '/placeholder.png'}
                alt={`${song.title} cover`}
              />
              <h3>{song.title}</h3>
              <p>{song.genre || 'Other'}</p>

              {song.uri && (
                <audio controls preload="none" src={song.uri}>
                  Your browser does not support audio playback.
                </audio>
              )}
            </article>
          ))}
        </div>

        <p style={{ marginTop: 24 }}>
          <Link to="/albums">← Back to Albums</Link>
        </p>
      </section>
    </main>
  )
}

export default AlbumDetails
