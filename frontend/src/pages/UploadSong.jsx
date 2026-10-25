
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Navbar from '../components/Navbar'

function UploadSong() {
    const navigate = useNavigate()

    const [form, setForm] = useState({
        title: '',
        genre: '',
        description: ''
    })

    const [music, setMusic] = useState(null)
    const [coverImage, setCoverImage] = useState(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setMessage('')
        setError('')

        if (!music || !coverImage) {
            setError('Please select both a music file and a cover image.')
            return
        }

        const formData = new FormData()
        formData.append('title', form.title)
        formData.append('genre', form.genre)
        formData.append('description', form.description)
        formData.append('music', music)
        formData.append('coverImage', coverImage)

        try {
            setLoading(true)

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/music/upload`,
                {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Song upload failed')
            }

            setMessage('Song uploaded successfully! It is waiting for admin approval.')

            setForm({
                title: '',
                genre: '',
                description: ''
            })
            setMusic(null)
            setCoverImage(null)

            e.target.reset()
        } catch (err) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="music-page">
            <Navbar />

            <section className="upload-section">
                <h1>Upload Your Song</h1>
                <p>Your song will be reviewed by an admin before publishing.</p>

                <form className="upload-form" onSubmit={handleSubmit}>
                    <label>Song Title</label>
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Enter song title"
                        required
                    />

                    <label>Genre</label>
                    <input
                        name="genre"
                        value={form.genre}
                        onChange={handleChange}
                        placeholder="e.g. Pop, Rock, Classical"
                        required
                    />

                    <label>Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Tell listeners about your song"
                        rows="4"
                    />

                    <label>Music File</label>
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={e => setMusic(e.target.files[0] || null)}
                        required
                    />

                    <label>Cover Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => setCoverImage(e.target.files[0] || null)}
                        required
                    />

                    {error && <p className="upload-error">{error}</p>}
                    {message && <p className="upload-success">{message}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Uploading...' : 'Upload Song'}
                    </button>

                    {message && (
                        <Link to="/artist/my-songs">
                            View My Songs
                        </Link>
                    )}
                </form>
            </section>
        </main>
    )
}

export default UploadSong
