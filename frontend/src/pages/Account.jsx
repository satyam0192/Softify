
import { useEffect, useState } from 'react'
import { Link } from 'react-router'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function Account() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [artistRequest, setArtistRequest] = useState(null)
  const [artistName, setArtistName] = useState('')
  const [artistBio, setArtistBio] = useState('')
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')

  useEffect(() => {
    async function fetchAccount() {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          credentials: 'include',
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Unable to load account')
        }

        setUser(data.user)

        // Fetch artist application status for normal users
        if (data.user.role === 'user') {
          const requestResponse = await fetch(
            `${API_URL}/artist-requests/me`,
            { credentials: 'include' }
          )

          if (requestResponse.ok) {
            const requestData = await requestResponse.json()
            setArtistRequest(requestData.request)
          }
        }
      } catch (err) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchAccount()
  }, [])

  async function handleArtistApplication(e) {
    e.preventDefault()
    setRequestLoading(true)
    setRequestMessage('')

    try {
      const response = await fetch(`${API_URL}/artist-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          artistName,
          bio: artistBio,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Keep the existing status visible if a request already exists
        if (data.request) {
          setArtistRequest(data.request)
        }

        throw new Error(data.message || 'Application failed')
      }

      setArtistRequest(data.request)
      setRequestMessage('Your artist application was submitted!')
    } catch (err) {
      setRequestMessage(err.message || 'Unable to submit application')
    } finally {
      setRequestLoading(false)
    }
  }

  return (
    <main className="music-page">
      <section className="account-page">
        <p className="eyebrow">YOUR SOFTIFY ACCOUNT</p>
        <h1>Account Overview</h1>

        <p className="account-subtitle">
          Manage your account and explore your music experience.
        </p>

        {loading && <p>Loading account...</p>}

        {error && <p className="music-error">{error}</p>}

        {!loading && !error && user && (
          <>
            <div className="account-card">
              <div className="account-avatar">
                {(user.username || 'U').charAt(0).toUpperCase()}
              </div>

              <h2>{user.username}</h2>

              <span className="account-role">{user.role}</span>

              <div className="account-details">
                <div>
                  <span>Username</span>
                  <strong>{user.username}</strong>
                </div>

                <div>
                  <span>Email Address</span>
                  <strong>{user.email}</strong>
                </div>

                <div>
                  <span>Account Type</span>
                  <strong>
                    {user.role?.charAt(0).toUpperCase()}
                    {user.role?.slice(1)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Become an Artist: normal users only */}
            {user.role === 'user' && (
              <section className="become-artist-card">
                <div className="become-artist-icon">♫</div>

                <div className="become-artist-content">
                  <p className="eyebrow">SHARE YOUR MUSIC</p>
                  <h2>Become an Artist</h2>

                  {artistRequest?.status === 'pending' ? (
                    <>
                      <p>
                        Your application is pending admin approval.
                        We'll update your access after the review.
                      </p>
                      <span className="account-role">Pending review</span>
                    </>
                  ) : artistRequest?.status === 'approved' ? (
                    <>
                      <p>
                        Your artist application has been approved.
                      </p>
                      <Link to="/artist" className="account-action-card">
                        <span>♫</span>
                        <div>
                          <h3>Open Artist Studio</h3>
                          <p>Manage your music and uploads.</p>
                        </div>
                      </Link>
                    </>
                  ) : artistRequest?.status === 'rejected' ? (
                    <p>
                      Your previous application was rejected.
                      Please contact the administrator for next steps.
                    </p>
                  ) : (
                    <>
                      <p>
                        Apply to publish your own songs on Softify.
                        Your application will be reviewed by an admin.
                      </p>

                      <form
                        className="become-artist-form"
                        onSubmit={handleArtistApplication}
                      >
                        <label>
                          Artist Name
                          <input
                            type="text"
                            value={artistName}
                            onChange={e => setArtistName(e.target.value)}
                            placeholder="Enter your artist name"
                            maxLength={50}
                            required
                          />
                        </label>

                        <label>
                          About You
                          <textarea
                            value={artistBio}
                            onChange={e => setArtistBio(e.target.value)}
                            placeholder="Tell us about your music..."
                            maxLength={500}
                            rows={3}
                            required
                          />
                        </label>

                        <button
                          type="submit"
                          className="submit-btn"
                          disabled={requestLoading}
                        >
                          {requestLoading
                            ? 'Submitting...'
                            : 'Apply to Become an Artist'}
                        </button>
                      </form>
                    </>
                  )}

                  {requestMessage && (
                    <p role="status">{requestMessage}</p>
                  )}
                </div>
              </section>
            )}

            <div className="account-actions">
              {user.role === 'artist' && (
                <>
                  <Link to="/artist" className="account-action-card">
                    <span>♫</span>
                    <div>
                      <h3>Artist Studio</h3>
                      <p>Manage your music and uploads.</p>
                    </div>
                  </Link>

                  <Link
                    to="/artist/profile"
                    className="account-action-card"
                  >
                    <span>✎</span>
                    <div>
                      <h3>Edit Artist Profile</h3>
                      <p>Update your artist information.</p>
                    </div>
                  </Link>

                  <Link
                    to="/artist/my-songs"
                    className="account-action-card"
                  >
                    <span>▤</span>
                    <div>
                      <h3>My Songs</h3>
                      <p>Track your song submissions.</p>
                    </div>
                  </Link>
                </>
              )}

              {user.role === 'admin' && (
                <Link to="/admin" className="account-action-card">
                  <span>⚙</span>
                  <div>
                    <h3>Admin Panel</h3>
                    <p>Manage song reviews and approvals.</p>
                  </div>
                </Link>
              )}

              <Link to="/home" className="account-action-card">
                <span>♫</span>
                <div>
                  <h3>Discover Music</h3>
                  <p>Return to your music library.</p>
                </div>
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export default Account
