
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useMusicPlayer } from '../context/MusicPlayerContext.jsx'

const API_URL = 'http://localhost:3000/api'

function Navbar() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const { clearPlayer } = useMusicPlayer()
  const navigate = useNavigate()

  useEffect(() => {
    async function getUser() {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Unable to fetch user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  async function handleLogout() {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }

      clearPlayer()
      setUser(null)
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout failed:', error.message)
    }
  }

  return (
    <header className="app-navbar">
      <Link to="/home" className="nav-brand">
        ♫ Softify
      </Link>

      
    <div className="nav-account">
      {!loading && user ? (
        <Link to="/account" className="account-link">
          <span className="account-avatar-small">
            {user.username?.charAt(0).toUpperCase() || 'U'}
          </span>
          <span>{user.username}</span>
        </Link>
      ) : !loading ? (
        <Link to="/login" className="account-link">
          Login
        </Link>
      ) : null}
    </div>

    </header>
  )
}

export default Navbar
