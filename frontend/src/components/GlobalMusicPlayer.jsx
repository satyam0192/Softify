
import { useMusicPlayer } from '../context/MusicPlayerContext'

function GlobalMusicPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    playerError,
    audioRef,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    formatTime,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    setPlayerError,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
  } = useMusicPlayer()

  return (
    <>
      <audio
        ref={audioRef}
        src={currentSong?.uri || undefined}
        preload="metadata"
        onTimeUpdate={e =>
          setCurrentTime(e.currentTarget.currentTime)
        }
        onLoadedMetadata={e =>
          setDuration(e.currentTarget.duration)
        }
        onDurationChange={e =>
          setDuration(e.currentTarget.duration)
        }
        onEnded={playNext}
        onError={() => {
          setIsPlaying(false)
          setPlayerError('Unable to play this song.')
        }}
      />

      {currentSong && (
        <section className="bottom-music-player">
          <div className="player-song-info">
            <img
              src={currentSong.coverImage || '/placeholder.png'}
              alt=""
            />

            <div className="player-song-text">
              <strong>{currentSong.title}</strong>
              <span>
                {currentSong.artist?.username || 'Unknown artist'}
              </span>
            </div>
          </div>

          <div className="player-center">
            <div className="player-controls">
              <button
                type="button"
                onClick={playPrevious}
                aria-label="Previous song"
              >
                |◀
              </button>

              <button
                type="button"
                className="main-play-button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? 'Ⅱ' : '▶'}
              </button>

              <button
                type="button"
                onClick={playNext}
                aria-label="Next song"
              >
                ▶|
              </button>
            </div>

            <div className="player-progress">
              <span>{formatTime(currentTime)}</span>

              <input
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                value={Math.min(currentTime, duration || 0)}
                onChange={e => seek(Number(e.target.value))}
                aria-label="Seek song"
              />

              <span>{formatTime(duration)}</span>
            </div>

            {playerError && (
              <p className="music-error">{playerError}</p>
            )}
          </div>

          
<div className="player-volume-label">
  <span>♫</span>

  <button
    type="button"
    className="mute-button"
    onClick={() => setIsMuted(prev => !prev)}
    aria-label={isMuted ? 'Unmute' : 'Mute'}
    title={isMuted ? 'Unmute' : 'Mute'}
  >
    {isMuted || volume === 0
      ? '🔇'
      : volume < 0.5
        ? '🔉'
        : '🔊'}
  </button>

  <input
    type="range"
    className="volume-slider"
    min="0"
    max="1"
    step="0.01"
    value={isMuted ? 0 : volume}
    onChange={e => {
      const nextVolume = Number(e.target.value)
      setVolume(nextVolume)

      if (nextVolume > 0 && isMuted) {
        setIsMuted(false)
      }
    }}
    aria-label="Volume"
    title="Volume"
  />
</div>

        </section>
      )}
    </>
  )
}

export default GlobalMusicPlayer
