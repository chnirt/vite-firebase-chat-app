import axios from 'axios'
import moment from 'moment'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  SPOTIFY_AUTH_ENDPOINT,
  SPOTIFY_CLIENT_ID,
  SPOTIFY_REDIRECT_URI,
  SPOTIFY_RESPONSE_TYPE,
} from '../../env'
import { useLocalStorage } from '../../hooks'

const urls = [
  'https://wallpaperaccess.com/full/2471317.gif',
  'https://wallpaperaccess.com/full/775137.gif',
  'https://wallpaperaccess.com/full/869923.gif',
  'https://cdna.artstation.com/p/assets/images/images/043/163/290/original/augustin-cart-gif-lofi-9-40.gif?1636484684',
  'https://64.media.tumblr.com/7931e97031b430d11b23dfb4a5ca6713/df1a98e7c47a2bff-70/s640x960/26aef91dd548ae2cb09903fe25908ed14d13f267.gifv',
  'https://i.pinimg.com/originals/1a/f6/89/1af689d42bdb7686df444f22925f9e89.gif',
  'https://i.pinimg.com/originals/12/0e/03/120e03442dc1d98f8a72407cddf53d5d.gif',
]

const AudioPlayer = () => {
  const [token] = useLocalStorage('token', '')
  const audioRef = useRef(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlay, setPlay] = useState(false)
  const [audioIndex, setAudioIndex] = useState(0)

  const [query, setQuery] = useState('')
  const [audioList, setAudioList] = useState([])

  const handleLoadedData = useCallback(() => {
    setDuration(audioRef.current.duration)
    if (isPlay) audioRef.current.play()
  }, [isPlay])

  const handleTimeUpdate = useCallback(() => {
    setCurrentTime(audioRef.current?.currentTime)
  }, [])

  const handlePausePlayClick = useCallback(() => {
    if (isPlay) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlay(!isPlay)
  }, [isPlay])

  const handleTimeSliderChange = useCallback(
    (value) => {
      audioRef.current.currentTime = value
      setCurrentTime(value)

      if (!isPlay) {
        setPlay(true)
        audioRef.current.play()
      }
    },
    [isPlay]
  )

  const handleResetAudio = useCallback(() => {
    setPlay(false)
  }, [])

  const handlePrev = useCallback(() => {
    setAudioIndex((prevState) => Math.max(prevState - 1, 0))
  }, [handleResetAudio])

  const handleNext = useCallback(() => {
    setAudioIndex((prevState) => Math.min(prevState + 1, audioList.length - 1))
  }, [audioList, handleResetAudio])

  const formatSecondToMMSS = useCallback(
    (second) => moment.utc(second * 1000).format('mm:ss'),
    []
  )

  const handleSelect = useCallback(async (ii) => setAudioIndex(ii), [])

  useEffect(() => {
    const searchArtists = async () => {
      const { data } = await axios.get('https://api.spotify.com/v1/search', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          q: '2am',
          type: 'track',
          offset: 0,
          limit: 10,
        },
      })
      // console.log(JSON.stringify(data.tracks.items[0], null, 2))
      setAudioList(data.tracks.items)
    }
    if (token) {
      searchArtists()
    }
  }, [token])

  return (
    <div>
      {/* <div
        style={{
          flex: 1,
          backgroundImage: `url(${urls[2]})`,

          position: 'fixed',
          top: 0,
          left: 0,

          minWidth: '100%',
          minHeight: '100%',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          zIndex: -1,
          backgroundColor: '#010a01',
        }}
      /> */}
      {/* <p className="neonText">AudioPlayer</p> */}
      <p>{audioList[audioIndex]?.name}</p>
      <audio
        ref={audioRef}
        src={audioList[audioIndex]?.preview_url}
        onLoadedData={handleLoadedData}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setPlay(false)}
      // controls
      >
        Your browser does not support the
        <code> audio</code> element.
      </audio>
      {/* <br /> */}
      <p>
        {formatSecondToMMSS(Math.floor(currentTime))}/
        {formatSecondToMMSS(Math.floor(duration))}
      </p>
      <button onClick={handlePrev}>Prev</button>
      <button onClick={handlePausePlayClick}>
        {isPlay ? 'Pause' : 'Play'}
      </button>
      <button onClick={handleNext}>Next</button>
      <input
        type="range"
        value={currentTime}
        onChange={(e) => handleTimeSliderChange(e.target.value)}
        min={0}
        max={duration}
      // step={duration / 10}
      />
      <br />
      <a
        href={`${SPOTIFY_AUTH_ENDPOINT}?client_id=${SPOTIFY_CLIENT_ID}&redirect_uri=${SPOTIFY_REDIRECT_URI}&response_type=${SPOTIFY_RESPONSE_TYPE}`}
      >
        Login to Spotify
      </a>
      <br />
      <div
        style={{
          height: 400,
          overflowY: 'scroll',
          paddingTop: 8,
          paddingBottom: 8,
        }}
      >
        {audioList.length > 0 &&
          audioList.map((item, ii) => {
            const name = item?.name
            const artists = item?.artists
            return (
              <div
                key={`audio-${ii}`}
                style={{
                  border: 'solid 1px black',
                }}
              >
                <h2>{name}</h2>
                <p>{artists.map((artist) => artist.name).join(' ')}</p>
                <button onClick={() => handleSelect(ii)}>Select</button>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default AudioPlayer
