
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Navbar from '../components/Navbar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function ArtistProfile() {
    const [form, setForm] = useState({
        artistName: '',
        bio: '',
        genre: ''
    })

    const [profileImage, setProfileImage] = useState(null)
    const [currentProfileImage, setCurrentProfileImage] = useState('')
    const [fetchingProfile, setFetchingProfile] = useState(true)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    // Fetch existing artist profile
    useEffect(() => {
        async function fetchProfile() {
            try {
                const response = await fetch(
                    `${API_URL}/artists/profile/me`,
                    { credentials: 'include' }
                )

                const data = await response.json()

                // Profile does not exist yet
                if (response.status === 404) return

                if (!response.ok) {
                    throw new Error(
                        data.message || 'Failed to load profile'
                    )
                }

                const artist = data.artist

                setForm({
                    artistName: artist.artistName || '',
                    bio: artist.bio || '',
                    genre: artist.genre || ''
                })

                setCurrentProfileImage(artist.profileImage || '')
            } catch (err) {
                setError(err.message || 'Failed to load profile')
            } finally {
                setFetchingProfile(false)
            }
        }

        fetchProfile()
    }, [])

    function handleChange(e) {
        const { name, value } = e.target

        setForm(prev => ({
            ...prev,
            [name]: value
        }))
    }

    async function handleSubmit(e) {
        e.preventDefault()

        setLoading(true)
        setMessage('')
        setError('')

        const formData = new FormData()
        formData.append('artistName', form.artistName)
        formData.append('bio', form.bio)
        formData.append('genre', form.genre)

        if (profileImage) {
            formData.append('profileImage', profileImage)
        }

        try {
            const response = await fetch(
                `${API_URL}/artists/profile`,
                {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.message || 'Failed to save profile'
                )
            }

            setForm({
                artistName: data.artist?.artistName || '',
                bio: data.artist?.bio || '',
                genre: data.artist?.genre || ''
            })

            setCurrentProfileImage(
                data.artist?.profileImage || currentProfileImage
            )

            setProfileImage(null)
            e.target.reset()

            setMessage(
                data.message || 'Artist profile saved successfully!'
            )
        } catch (err) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    if (fetchingProfile) {
        return (
            <main className="music-page">
                <Navbar />
                <section className="upload-section">
                    <p>Loading artist profile...</p>
                </section>
            </main>
        )
    }

    return (
        <main className="music-page">
            <Navbar />

            <section className="upload-section">
                <p className="eyebrow">ARTIST STUDIO</p>
                <h1>Edit Artist Profile</h1>
                <p>Tell listeners about yourself and your music.</p>

                <form className="upload-form" onSubmit={handleSubmit}>
                    <label htmlFor="artistName">Artist Name</label>
                    <input
                        id="artistName"
                        name="artistName"
                        value={form.artistName}
                        onChange={handleChange}
                        placeholder="Enter your artist name"
                        required
                    />

                    <label htmlFor="bio">Bio</label>
                    <textarea
                        id="bio"
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        placeholder="Tell listeners about yourself"
                        rows="4"
                    />

                    <label htmlFor="genre">Genre</label>
                    <input
                        id="genre"
                        name="genre"
                        value={form.genre}
                        onChange={handleChange}
                        placeholder="e.g. Pop, Rock, Classical"
                    />

                    <label htmlFor="profileImage">Profile Image</label>
                    <input
                        id="profileImage"
                        type="file"
                        accept="image/*"
                        onChange={e =>
                            setProfileImage(e.target.files[0] || null)
                        }
                    />

                    {currentProfileImage && (
                        <div>
                            <p>Current Profile Image</p>
                            <img
                                src={currentProfileImage}
                                alt="Current artist profile"
                                style={{
                                    width: '120px',
                                    height: '120px',
                                    objectFit: 'cover',
                                    borderRadius: '50%'
                                }}
                            />
                        </div>
                    )}

                    {profileImage && (
                        <p>Selected image: {profileImage.name}</p>
                    )}

                    {error && (
                        <p className="upload-error">{error}</p>
                    )}

                    {message && (
                        <p className="upload-success">{message}</p>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Profile'}
                    </button>

                    <Link to="/artist">
                        ← Back to Artist Studio
                    </Link>
                </form>
            </section>
        </main>
    )
}

export default ArtistProfile
