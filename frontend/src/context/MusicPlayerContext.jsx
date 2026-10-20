
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback
} from 'react'

const MusicPlayerContext = createContext(null)

export function MusicPlayerProvider({ children }) {
  const [queue, setQueue] = useState([])
  const [currentSong, setCurrentSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playerError, setPlayerError] = useState('')

  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)

  const audioRef = useRef(null)

  // Play or pause the current song
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying && currentSong?.uri) {
      audio.play().catch(() => {
        setIsPlaying(false)
        setPlayerError('Unable to play this song.')
      })
    } else {
      audio.pause()
    }
  }, [currentSong, isPlaying])

  // Apply volume and mute settings
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = volume
    audio.muted = isMuted
  }, [volume, isMuted])

  // Play a selected song
  const playSong = useCallback((song, songs = queue) => {
    if (!song) return

    setQueue(songs)
    setPlayerError('')

    if (currentSong?._id === song._id) {
      setIsPlaying(true)
      return
    }

    setCurrentTime(0)
    setDuration(0)
    setCurrentSong(song)
    setIsPlaying(true)
  }, [queue, currentSong])

  // Toggle play and pause
  const togglePlay = useCallback(() => {
    if (!currentSong) {
      if (queue.length > 0) {
        playSong(queue[0], queue)
      }
      return
    }

    setIsPlaying(prev => !prev)
    setPlayerError('')
  }, [currentSong, queue, playSong])

  // Play next song
  const playNext = useCallback(() => {
    if (queue.length === 0) return

    const index = queue.findIndex(
      song => String(song._id) === String(currentSong?._id)
    )

    const nextIndex = index < 0 ? 0 : (index + 1) % queue.length
    playSong(queue[nextIndex], queue)
  }, [queue, currentSong, playSong])

  // Play previous song
  const playPrevious = useCallback(() => {
    if (queue.length === 0) return

    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0
      setCurrentTime(0)
      return
    }

    const index = queue.findIndex(
      song => String(song._id) === String(currentSong?._id)
    )

    const previousIndex =
      index < 0 ? 0 : (index - 1 + queue.length) % queue.length

    playSong(queue[previousIndex], queue)
  }, [queue, currentSong, playSong])

  // Seek to a specific time
  const seek = useCallback((time) => {
    const audio = audioRef.current
    if (!audio) return

    const nextTime = Math.max(
      0,
      Math.min(Number(time) || 0, audio.duration || 0)
    )

    audio.currentTime = nextTime
    setCurrentTime(nextTime)
  }, [])

  // Clear everything when the user logs out
  const clearPlayer = useCallback(() => {
    const audio = audioRef.current

    if (audio) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }

    setIsPlaying(false)
    setCurrentSong(null)
    setQueue([])
    setCurrentTime(0)
    setDuration(0)
    setPlayerError('')
  }, [])

  // Format seconds as minutes:seconds
  function formatTime(time) {
    if (!Number.isFinite(time)) return '0:00'

    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)

    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }

  const value = {
    queue,
    setQueue,
    currentSong,
    isPlaying,
    currentTime,
    duration,
    playerError,
    audioRef,

    volume,
    setVolume,
    isMuted,
    setIsMuted,

    playSong,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    formatTime,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    setPlayerError,
    clearPlayer
  }

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  )
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext)

  if (!context) {
    throw new Error(
      'useMusicPlayer must be used inside MusicPlayerProvider'
    )
  }

  return context
}
