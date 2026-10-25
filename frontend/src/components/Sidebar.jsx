
import { useEffect, useState, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router'
import { useMusicPlayer } from '../context/MusicPlayerContext.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function Sidebar() {
  const [user, setUser] = useState(null)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarRef = useRef(null)
  const toggleRef = useRef(null)

  const navigate = useNavigate()
  const { clearPlayer } = useMusicPlayer()

  // Handle outside clicks
  useEffect(() => {
    function handleOutsideClick(event) {
      const sidebar = sidebarRef.current
      const toggle = toggleRef.current

      if (
        !sidebar ||
        sidebar.contains(event.target) ||
        toggle?.contains(event.target)
      ) {
        return
      }

      if (window.matchMedia('(min-width: 701px)').matches) {
        setCollapsed(true)
      } else {
        setMobileOpen(false)
      }
    }

    document.addEventListener('pointerdown', handleOutsideClick)

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick)
    }
  }, [])

  // Fetch logged-in user
  useEffect(() => {
    let cancelled = false

    async function fetchUser() {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          credentials: 'include',
        })

        if (!response.ok) {
          if (!cancelled) setUser(null)
          return
        }

        const data = await response.json()

        if (!cancelled) {
          setUser(data.user)
        }
      } catch (error) {
        console.error('Unable to fetch user:', error)
      }
    }

    fetchUser()

    return () => {
      cancelled = true
    }
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
      setMobileOpen(false)
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout failed:', error.message)
    }
  }

  const links = [
    { to: '/home', icon: '⌂', label: 'Home' },
    { to: '/albums', icon: '▤', label: 'Albums' },
    { to: '/artists', icon: '♬', label: 'Artists' },
    { to: '/playlists', icon: '▣', label: 'Playlists' },
  ]

  function closeMobileSidebar() {
    setMobileOpen(false)
  }

  function linkClass({ isActive }) {
    return `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
  }

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className="sidebar-mobile-toggle"
        onClick={() => {
          if (window.matchMedia('(min-width: 701px)').matches) {
            setCollapsed(prev => !prev)
          } else {
            setMobileOpen(prev => !prev)
          }
        }}
        aria-label="Toggle sidebar"
        aria-expanded={mobileOpen}
      >
        ☰
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={closeMobileSidebar}
          aria-label="Close sidebar"
        />
      )}

      <aside
        ref={sidebarRef}
        className={`app-sidebar ${
          collapsed ? 'sidebar-collapsed' : ''
        } ${mobileOpen ? 'sidebar-mobile-open' : ''}`}
      >
        <div className="sidebar-heading">
          <span>{collapsed ? '♫' : 'YOUR LIBRARY'}</span>

          <button
            type="button"
            onClick={() => setCollapsed(prev => !prev)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              title={collapsed ? link.label : undefined}
              className={linkClass}
              onClick={closeMobileSidebar}
            >
              <span className="sidebar-icon">{link.icon}</span>
              {!collapsed && <span>{link.label}</span>}
            </NavLink>
          ))}

          {user?.role === 'artist' && (
            <>
              <p className="sidebar-section-title">
                {!collapsed && 'ARTIST'}
              </p>

              {[
                { to: '/artist', icon: '◈', label: 'Artist Studio' },
                { to: '/artist/upload', icon: '+', label: 'Upload Song' },
                { to: '/artist/my-songs', icon: '♫', label: 'My Songs' },
                { to: '/artist/profile', icon: '◎', label: 'Artist Profile' },
              ].map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  title={collapsed ? link.label : undefined}
                  className={linkClass}
                  onClick={closeMobileSidebar}
                >
                  <span className="sidebar-icon">{link.icon}</span>
                  {!collapsed && <span>{link.label}</span>}
                </NavLink>
              ))}
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <p className="sidebar-section-title">
                {!collapsed && 'ADMINISTRATION'}
              </p>

              <NavLink
                to="/admin"
                title={collapsed ? 'Admin Panel' : undefined}
                className={linkClass}
                onClick={closeMobileSidebar}
              >
                <span className="sidebar-icon">⚙</span>
                {!collapsed && <span>Admin Panel</span>}
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-bottom">
          {user && (
            <NavLink
              to="/account"
              className={linkClass}
              title={collapsed ? 'Account' : undefined}
              onClick={closeMobileSidebar}
            >
              <span className="sidebar-icon">◎</span>
              {!collapsed && <span>Account</span>}
            </NavLink>
          )}

          {user ? (
            <button
              type="button"
              className="sidebar-link sidebar-logout"
              onClick={handleLogout}
              title={collapsed ? 'Logout' : undefined}
            >
              <span className="sidebar-icon">⇥</span>
              {!collapsed && <span>Logout</span>}
            </button>
          ) : (
            <NavLink
              to="/login"
              className={linkClass}
              onClick={closeMobileSidebar}
            >
              <span className="sidebar-icon">⇥</span>
              {!collapsed && <span>Login</span>}
            </NavLink>
          )}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
