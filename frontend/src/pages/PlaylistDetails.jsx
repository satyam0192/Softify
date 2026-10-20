
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useMusicPlayer } from '../context/MusicPlayerContext'
import Navbar from '../components/Navbar'

const API_URL = 'http://localhost:3000/api'

function PlaylistDetails() {
    const { playlistId } = useParams()

    const [playlist, setPlaylist] = useState(null)
    const [songs, setSongs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [busySongId, setBusySongId] = useState(null)

    const {
        currentSong,
        isPlaying,
        playSong,
        togglePlay
    } = useMusicPlayer()

    const fetchData = useCallback(async () => {
        try {
            setError('')

            const [playlistResponse, songsResponse] = await Promise.all([
                fetch(`${API_URL}/playlists/my`, {
                    credentials: 'include'
                }),
                fetch(`${API_URL}/music`, {
                    credentials: 'include'
                })
            ])

            const playlistData = await playlistResponse.json()
            const songsData = await songsResponse.json()

            if (!playlistResponse.ok) {
                throw new Error(
                    playlistData.message || 'Could not load playlists'
                )
            }

            if (!songsResponse.ok) {
                throw new Error(
                    songsData.message || 'Could not load songs'
                )
            }

            const selectedPlaylist = (playlistData.playlists || [])
                .find(item => String(item._id) === String(playlistId))

            if (!selectedPlaylist) {
                throw new Error('Playlist not found')
            }

            setPlaylist(selectedPlaylist)
            setSongs(songsData.musics || [])
        } catch (err) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }, [playlistId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    async function addSong(songId) {
        setError('')
        setMessage('')
        setBusySongId(songId)

        try {
            const response = await fetch(
                `${API_URL}/playlists/${playlistId}/songs`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ songId })
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Could not add song')
            }

            await fetchData()
            setMessage('Song added to playlist!')
        } catch (err) {
            setError(err.message || 'Could not add song')
        } finally {
            setBusySongId(null)
        }
    }

    async function removeSong(songId) {
        setError('')
        setMessage('')
        setBusySongId(songId)

        try {
            const response = await fetch(
                `${API_URL}/playlists/${playlistId}/songs/${songId}`,
                {
                    method: 'DELETE',
                    credentials: 'include'
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Could not remove song')
            }

            await fetchData()
            setMessage('Song removed from playlist!')
        } catch (err) {
            setError(err.message || 'Could not remove song')
        } finally {
            setBusySongId(null)
        }
    }

    const playlistSongs = (playlist?.songs || []).filter(
        song => song && typeof song === 'object' && song._id
    )

    const playlistSongIds = (playlist?.songs || []).map(song =>
        String(typeof song === 'object' ? song?._id : song)
    )

    function handlePlay(song, queue) {
        if (currentSong?._id === song._id) {
            togglePlay()
        } else {
            playSong(song, queue)
        }
    }

    if (loading) {
        return (
            <main className="music-page">
                
                <p>Loading playlist...</p>
            </main>
        )
    }

    return (
        <main className="music-page">
            

            <section className="playlist-details-page">
                <Link to="/playlists" className="back-link">
                    ← Your Playlists
                </Link>

                {error && (
                    <p className="music-error" role="alert">{error}</p>
                )}

                {message && (
                    <p className="playlist-success" role="status">
                        {message}
                    </p>
                )}

                {playlist && (
                    <>
                        <div className="playlist-details-header">
                            <div className="playlist-details-cover">♫</div>

                            <div>
                                <p className="eyebrow">PLAYLIST</p>
                                <h1>{playlist.name}</h1>

                                <p>
                                    {playlist.description || 'Your music collection'}
                                </p>

                                <p>{playlistSongs.length} songs</p>

                                {playlistSongs.length > 0 && (
                                    <button
                                        type="button"
                                        className="playlist-play-button"
                                        onClick={() =>
                                            handlePlay(
                                                playlistSongs[0],
                                                playlistSongs
                                            )
                                        }
                                    >
                                        {currentSong?._id === playlistSongs[0]._id &&
                                        isPlaying
                                            ? 'Pause'
                                            : '▶ Play Playlist'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <h2>Available Songs</h2>

                        {songs.length === 0 && (
                            <p>No approved songs are available right now.</p>
                        )}

                        <div className="playlist-song-list">
                            {songs.map(song => {
                                const songId = String(song._id || song.id)
                                const alreadyAdded =
                                    playlistSongIds.includes(songId)

                                return (
                                    <div
                                        className="playlist-song-row"
                                        key={songId}
                                    >
                                        <img
                                            src={song.coverImage || ''}
                                            alt=""
                                        />

                                        <div className="playlist-song-info">
                                            <strong>{song.title}</strong>
                                            <span>
                                                {song.artist?.username ||
                                                    'Unknown Artist'}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            disabled={
                                                alreadyAdded ||
                                                busySongId === songId
                                            }
                                            onClick={() => addSong(songId)}
                                        >
                                            {busySongId === songId
                                                ? 'Please wait...'
                                                : alreadyAdded
                                                  ? 'Added'
                                                  : '+ Add'}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>

                        <h2>Songs in This Playlist</h2>

                        {playlistSongs.length === 0 && (
                            <p>
                                No songs added yet. Add songs from the list above.
                            </p>
                        )}

                        <div className="playlist-song-list">
                            {playlistSongs.map(song => (
                                <div
                                    className="playlist-song-row"
                                    key={song._id}
                                >
                                    <img
                                        src={song.coverImage || ''}
                                        alt=""
                                    />

                                    <div className="playlist-song-info">
                                        <strong>{song.title}</strong>
                                        <span>
                                            {song.artist?.username ||
                                                'Unknown Artist'}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handlePlay(song, playlistSongs)
                                        }
                                    >
                                        {currentSong?._id === song._id &&
                                        isPlaying
                                            ? 'Pause'
                                            : '▶'}
                                    </button>

                                    <button
                                        type="button"
                                        className="playlist-remove-button"
                                        disabled={busySongId === String(song._id)}
                                        onClick={() => removeSong(String(song._id))}
                                    >
                                        {busySongId === String(song._id)
                                            ? 'Removing...'
                                            : 'Remove'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </main>
    )
}

export default PlaylistDetails
