
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Navbar from '../components/Navbar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function Albums() {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchAlbums() {
      try {
        const response = await fetch(`${API_URL}/music/album`, {
          credentials: 'include',
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to fetch albums')
        }

        setAlbums(data.albums || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAlbums()
  }, [])

  return (
    <main className="music-page">
      

      <section className="songs-section">
        <h1>Explore Albums</h1>
        <p>Discover music collections on Softify.</p>

        {loading && <p>Loading albums...</p>}
        {error && <p className="music-error">{error}</p>}

        {!loading && !error && albums.length === 0 && (
          <p>No albums available yet.</p>
        )}

        <div className="songs-grid">
          {albums.map((album) => (
            <Link
              to={`/albums/${album._id}`}
              className="album-card"
              key={album._id}
            >
              <div className="album-art">♫</div>
              <h3>{album.title}</h3>
              <p>{album.artist?.username || 'Unknown artist'}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Albums
