
import { useEffect, useState, useRef } from 'react'
import {
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate
} from 'react-router'
import './App.css'
import Navbar from './components/Navbar.jsx'
import Albums from './pages/Albums.jsx'
import AlbumDetails from './pages/AlbumDetails.jsx'
import Artists from './pages/Artists.jsx'
import ArtistDetails from './pages/ArtistDetails.jsx'
import MySongs from './pages/MySongs.jsx'
import UploadSong from './pages/UploadSong.jsx'
import ArtistDashboard from './pages/ArtistDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import ArtistProfile from './pages/ArtistProfile.jsx'
import { useMusicPlayer } from './context/MusicPlayerContext.jsx'
import GlobalMusicPlayer from './components/GlobalMusicPlayer.jsx'
import Account from './pages/Account.jsx'
import Playlists from './pages/Playlists.jsx'
import PlaylistDetails from './pages/PlaylistDetails.jsx'
import Sidebar from './components/Sidebar.jsx'

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth`

function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const endpoint = isRegister ? '/register' : '/login'

      const body = isRegister
        ? form
        : { email: form.email, password: form.password }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      if (isRegister) {
          setForm({ username: '', email: '', password: '' })
          setIsRegister(false)
          setMessage('Registration successful! Please login.')
      } else {
          navigate('/home', { replace: true })
      }
    } catch (error) {
      setMessage(error.message || 'Unable to connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="brand">♫ Softify</Link>

        <h1>{isRegister ? 'Create account' : 'Welcome back'}</h1>
        <p className="auth-subtitle">
          {isRegister
            ? 'Create your account to get started.'
            : 'Login to continue to Softify.'}
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={!isRegister ? 'active' : ''}
            onClick={() => {
              setIsRegister(false)
              setMessage('')
            }}
          >
            Login
          </button>

          <button
            type="button"
            className={isRegister ? 'active' : ''}
            onClick={() => {
              setIsRegister(true)
              setMessage('')
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <label>
              Username
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </label>

          {message && (
            <p className="auth-message" role="status">{message}</p>
          )}

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading
              ? 'Please wait...'
              : isRegister
                ? 'Create account'
                : 'Login'}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister)
              setMessage('')
            }}
          >
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>
      </section>
    </main>
  )
}





function Home() {
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const {
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    setQueue,
  } = useMusicPlayer()

  useEffect(() => {
    async function fetchSongs() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/music`,
          { credentials: 'include' }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch songs')
        }

        const fetchedSongs = data.musics || []

        setSongs(fetchedSongs)
        setQueue(fetchedSongs)
      } catch (err) {
        setError(err.message || 'Unable to load songs')
      } finally {
        setLoading(false)
      }
    }

    fetchSongs()
  }, [setQueue])

  // Search by song title, artist name, or genre
  const filteredSongs = songs.filter(song => {
    const query = searchQuery.trim().toLowerCase()

    return (
      song.title?.toLowerCase().includes(query) ||
      song.artist?.username?.toLowerCase().includes(query) ||
      song.genre?.toLowerCase().includes(query)
    )
  })

  function handleSongClick(song) {
    if (currentSong?._id === song._id) {
      togglePlay()
    } else {
      playSong(song, songs)
    }
  }

  return (
    <main className="music-page">
      <section className="music-hero">
        <p className="eyebrow">YOUR MUSIC, YOUR VIBE</p>

        <h1>Discover your next favourite.</h1>

        <p>Listen to music picked for your mood.</p>

        <div className="music-search">
          <span>⌕</span>

          <input
            type="search"
            placeholder="Search songs, artists, genres..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search songs, artists, and genres"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </section>

      <section className="songs-section">
        <h2>
          {searchQuery.trim() ? 'Search Results' : 'Available Music'}
        </h2>

        {loading && <p>Loading songs...</p>}

        {error && (
          <p className="music-error">{error}</p>
        )}

        {!loading && !error && filteredSongs.length === 0 && (
          <p>
            {searchQuery.trim()
              ? `No songs found for "${searchQuery}".`
              : 'No approved songs available yet. Check back soon!'}
          </p>
        )}

        {!loading && !error && filteredSongs.length > 0 && (
          <div className="songs-grid">
            {filteredSongs.map(song => {
              const isCurrentSong = currentSong?._id === song._id

              return (
                <article
                  className={`song-card ${
                    isCurrentSong ? 'active-song' : ''
                  }`}
                  key={song._id}
                  onClick={() => handleSongClick(song)}
                >
                  <div className="song-cover-wrap">
                    <img
                      src={song.coverImage || '/placeholder.png'}
                      alt={`${song.title} cover`}
                      loading="lazy"
                    />

                    <button
                      type="button"
                      className="card-play-button"
                      aria-label={
                        isCurrentSong && isPlaying
                          ? `Pause ${song.title}`
                          : `Play ${song.title}`
                      }
                      onClick={e => {
                        e.stopPropagation()
                        handleSongClick(song)
                      }}
                    >
                      {isCurrentSong && isPlaying ? 'Ⅱ' : '▶'}
                    </button>
                  </div>

                  <h3>{song.title}</h3>

                  <p>
                    {song.artist?.username || 'Unknown artist'}
                  </p>

                  <span>{song.genre || 'Other'}</span>

                  <p className="card-play-hint">
                    {isCurrentSong
                      ? isPlaying
                        ? 'Now playing'
                        : 'Paused'
                      : 'Click to play'}
                  </p>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}





// function AdminDashboard() {
//   return <main className="simple-page"><h1>Admin Dashboard</h1></main>
// }

// function ArtistDashboard() {
//   return <main className="simple-page"><h1>Artist Dashboard</h1></main>
// }


function ProtectedRoute({ allowedRoles, children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkUser() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/me`,
          { credentials: 'include' }
        )

        if (!response.ok) {
          setUser(null)
          return
        }

        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  if (loading) {
    return <p>Checking authentication...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}


function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <Sidebar />
      <main className="app-main-content">
        {children}
      </main>
    </div>
  )
}



function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route path="/login" element={<Login />} />

        <Route
          path="/home"
          element={
            <AppLayout>
              <Home />
            </AppLayout>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout>
                <AdminDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/artist"
          element={
            <ProtectedRoute allowedRoles={['artist']}>
              <AppLayout>
                <ArtistDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/albums"
          element={
            <ProtectedRoute allowedRoles={['user', 'artist', 'admin']}>
              <AppLayout>
                <Albums />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/albums/:albumId"
          element={
            <ProtectedRoute allowedRoles={['user', 'artist', 'admin']}>
              <AppLayout>
                <AlbumDetails />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/artists"
          element={
            <ProtectedRoute allowedRoles={['user', 'artist', 'admin']}>
              <AppLayout>
                <Artists />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/artists/:artistId"
          element={
            <ProtectedRoute allowedRoles={['user', 'artist', 'admin']}>
              <AppLayout>
                <ArtistDetails />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/artist/my-songs"
          element={
            <ProtectedRoute allowedRoles={['artist']}>
              <AppLayout>
                <MySongs />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/artist/upload"
          element={
            <ProtectedRoute allowedRoles={['artist']}>
              <AppLayout>
                <UploadSong />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/artist/profile"
          element={
            <ProtectedRoute allowedRoles={['artist']}>
              <AppLayout>
                <ArtistProfile />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/account"
          element={
            <ProtectedRoute allowedRoles={['user', 'artist', 'admin']}>
              <AppLayout>
                <Account />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/playlists"
          element={
            <ProtectedRoute allowedRoles={['user', 'artist', 'admin']}>
              <AppLayout>
                <Playlists />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/playlists/:playlistId"
          element={
            <ProtectedRoute allowedRoles={['user', 'artist', 'admin']}>
              <AppLayout>
                <PlaylistDetails />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<h1>404 - Page Not Found</h1>}
        />
      </Routes>

      <GlobalMusicPlayer />
    </>
  )
}



export default App
