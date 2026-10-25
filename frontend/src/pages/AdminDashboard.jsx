
import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function AdminDashboard() {
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewNotes, setReviewNotes] = useState({})
  const [processingId, setProcessingId] = useState('')

  const [artistRequests, setArtistRequests] = useState([])
  const [artistLoading, setArtistLoading] = useState(true)
  const [artistError, setArtistError] = useState('')
  const [processingArtistId, setProcessingArtistId] = useState('')
  const [artistFeedback, setArtistFeedback] = useState('')

  // Fetch pending songs
  async function fetchPendingSongs() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `${API_URL}/admin/songs/pending`,
        { credentials: 'include' }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load pending songs')
      }

      setSongs(data.songs || data.musics || [])
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Fetch pending artist applications
  async function fetchArtistRequests() {
    try {
      setArtistLoading(true)
      setArtistError('')

      const response = await fetch(
        `${API_URL}/artist-requests/pending`,
        { credentials: 'include' }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to load artist applications'
        )
      }

      setArtistRequests(data.requests || [])
    } catch (err) {
      setArtistError(err.message || 'Unable to load artist applications')
    } finally {
      setArtistLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingSongs()
    fetchArtistRequests()
  }, [])

  // Approve or reject a song
  async function reviewSong(songId, decision) {
    try {
      setProcessingId(songId)
      setError('')

      const response = await fetch(
        `${API_URL}/admin/songs/${songId}/review`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            decision,
            reviewNote: reviewNotes[songId] || '',
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to review song')
      }

      setSongs(current =>
        current.filter(song => song._id !== songId)
      )
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setProcessingId('')
    }
  }

  
  // Delete any song (admin only)
  async function handleDeleteSong(songId) {
    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this song?'
    )

    if (!confirmed) return

    try {
      setProcessingId(songId)
      setError('')

      const response = await fetch(
        `${API_URL}/admin/songs/${songId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete song')
      }

      setSongs(current =>
        current.filter(song => song._id !== songId)
      )
    } catch (err) {
      setError(err.message || 'Failed to delete song')
    } finally {
      setProcessingId('')
    }
  }


  // Approve or reject an artist application
  async function reviewArtistRequest(requestId, action) {
    try {
      setProcessingArtistId(requestId)
      setArtistError('')
      setArtistFeedback('')

      const response = await fetch(
        `${API_URL}/artist-requests/${requestId}/review`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ action }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Unable to review artist application'
        )
      }

      setArtistRequests(current =>
        current.filter(request => request._id !== requestId)
      )

      setArtistFeedback(
        action === 'approve'
          ? 'Artist application approved successfully.'
          : 'Artist application rejected.'
      )
    } catch (err) {
      setArtistError(err.message || 'Unable to review application')
    } finally {
      setProcessingArtistId('')
    }
  }

  return (
    <main className="music-page">
      <section className="admin-dashboard">
        <p className="eyebrow">SOFTIFY ADMIN</p>
        <h1>Admin Control Panel</h1>
        <p>Manage artist applications and review music submissions.</p>

        {/* Artist Applications */}
        <section className="admin-artist-section">
          <div className="admin-section-heading">
            <div>
              <p className="eyebrow">CREATOR MANAGEMENT</p>
              <h2>Artist Applications</h2>
              <p>Review requests from users who want to become artists.</p>
            </div>

            <button
              type="button"
              className="admin-refresh-button"
              onClick={fetchArtistRequests}
              disabled={artistLoading}
            >
              {artistLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <div className="admin-summary">
            <span>Pending artist requests</span>
            <strong>{artistRequests.length}</strong>
          </div>

          {artistFeedback && (
            <p className="admin-success-message" role="status">
              {artistFeedback}
            </p>
          )}

          {artistLoading && <p>Loading artist applications...</p>}

          {artistError && (
            <p className="music-error">{artistError}</p>
          )}

          {!artistLoading &&
            !artistError &&
            artistRequests.length === 0 && (
              <p>No pending artist applications.</p>
            )}

          <div className="admin-artist-grid">
            {artistRequests.map(request => (
              <article
                className="admin-artist-card"
                key={request._id}
              >
                <div className="admin-artist-card-top">
                  <div className="admin-artist-avatar">
                    {(request.artistName || 'A')
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <span className="artist-pending-badge">
                    Pending
                  </span>
                </div>

                <h3>{request.artistName}</h3>

                <p className="admin-applicant-username">
                  Account: {request.user?.username || 'Unknown'}
                </p>

                <p className="admin-applicant-email">
                  {request.user?.email || 'Email unavailable'}
                </p>

                <div className="admin-artist-bio">
                  <span>About the artist</span>
                  <p>{request.bio}</p>
                </div>

                <p className="admin-application-date">
                  Applied:{' '}
                  {request.createdAt
                    ? new Date(request.createdAt).toLocaleDateString()
                    : 'Date unavailable'}
                </p>

                <div className="admin-artist-actions">
                  <button
                    type="button"
                    className="admin-artist-approve"
                    disabled={processingArtistId === request._id}
                    onClick={() =>
                      reviewArtistRequest(request._id, 'approve')
                    }
                  >
                    {processingArtistId === request._id
                      ? 'Processing...'
                      : 'Approve'}
                  </button>

                  <button
                    type="button"
                    className="admin-artist-reject"
                    disabled={processingArtistId === request._id}
                    onClick={() =>
                      reviewArtistRequest(request._id, 'reject')
                    }
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Existing Song Approval Section */}
        <section className="admin-songs-section">
          <div className="admin-section-heading">
            <div>
              <p className="eyebrow">MUSIC MODERATION</p>
              <h2>Song Approvals</h2>
              <p>Review music submissions before they go public.</p>
            </div>

            <button
              type="button"
              className="admin-refresh-button"
              onClick={fetchPendingSongs}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <div className="admin-summary">
            <span>Pending submissions</span>
            <strong>{songs.length}</strong>
          </div>

          {loading && <p>Loading pending songs...</p>}

          {error && <p className="music-error">{error}</p>}

          {!loading && !error && songs.length === 0 && (
            <p>No pending songs. You're all caught up!</p>
          )}

          <div className="songs-grid">
            {songs.map(song => (
              <article className="song-card" key={song._id}>
                <img
                  src={song.coverImage || '/placeholder.png'}
                  alt={song.title}
                />

                <h3>{song.title}</h3>
                <p>Artist: {song.artist?.username || 'Unknown'}</p>
                <p>Genre: {song.genre || 'Other'}</p>
                <p>{song.description || 'No description'}</p>

                {song.uri && (
                  <audio
                    controls
                    preload="none"
                    src={song.uri}
                  />
                )}

                <label htmlFor={`note-${song._id}`}>
                  Review note
                </label>

                <textarea
                  id={`note-${song._id}`}
                  rows="3"
                  placeholder="Optional feedback for the artist"
                  value={reviewNotes[song._id] || ''}
                  onChange={e =>
                    setReviewNotes(previous => ({
                      ...previous,
                      [song._id]: e.target.value,
                    }))
                  }
                />

                <div className="admin-review-actions">
                  <button
                    type="button"
                    disabled={processingId === song._id}
                    onClick={() => reviewSong(song._id, 'approved')}
                  >
                    {processingId === song._id ? 'Processing...' : 'Approve'}
                  </button>

                  <button
                    type="button"
                    disabled={processingId === song._id}
                    onClick={() => reviewSong(song._id, 'rejected')}
                  >
                    {processingId === song._id ? 'Processing...' : 'Reject'}
                  </button>
                
                  
                    <button
                    type="button"
                    className="admin-artist-reject"
                    disabled={processingId === song._id}
                    onClick={() => handleDeleteSong(song._id)}
                    >
                    {processingId === song._id ? 'Deleting...' : 'Delete Song'}
                    </button>


                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

export default AdminDashboard
