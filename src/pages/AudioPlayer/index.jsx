import moment from 'moment'
import { useCallback, useRef, useState } from 'react'

const urls = [
  'https://wallpaperaccess.com/full/2471317.gif',
  'https://wallpaperaccess.com/full/775137.gif',
  'https://wallpaperaccess.com/full/869923.gif',
  'https://cdna.artstation.com/p/assets/images/images/043/163/290/original/augustin-cart-gif-lofi-9-40.gif?1636484684',
  'https://64.media.tumblr.com/7931e97031b430d11b23dfb4a5ca6713/df1a98e7c47a2bff-70/s640x960/26aef91dd548ae2cb09903fe25908ed14d13f267.gifv',
  'https://i.pinimg.com/originals/1a/f6/89/1af689d42bdb7686df444f22925f9e89.gif',
  'https://i.pinimg.com/originals/12/0e/03/120e03442dc1d98f8a72407cddf53d5d.gif',
]
const audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
const audioUrls = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
]

const AudioPlayer = () => {
  const audioRef = useRef(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlay, setPlay] = useState(false)
  const [audioIndex, setAudioIndex] = useState(0)
  const length = 3

  const handleLoadedData = useCallback(() => {
    setDuration(audioRef.current.duration)
    if (isPlay) audioRef.current.play()
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

      // if (!isPlay) {
      //   setPlay(true)
      //   audioRef.current.play()
      // }
    },
    [isPlay]
  )

  const handlePrev = useCallback(() => {
    setAudioIndex((prevState) => Math.max(prevState - 1, 0))
  }, [])

  const handleNext = useCallback(() => {
    setAudioIndex((prevState) => Math.min(prevState + 1, length))
  }, [])

  const formatSecondToMMSS = useCallback(
    (second) => moment.utc(second * 1000).format('mm:ss'),
    []
  )

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
      <p>{audioIndex}</p>
      <audio
        ref={audioRef}
        src={audioUrl}
        onLoadedData={handleLoadedData}
        onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
        onEnded={() => setPlay(false)}
        controls
      >
        Your browser does not support the
        <code> audio</code> element.
      </audio>
      <br />
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
      {/* {audioUrls.length > 0 &&
        audioUrls.map((url) => (
          <audio src={url} controls>
            Your browser does not support the
            <code code> audio</code> element.
          </audio>
        ))} */}
      <br />
      {/* <iframe
        width="853"
        height="480"
        src={'https://youtube.com/embed/kROrqp0Dx8o'}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Embedded youtube"
      /> */}
    </div>
  )
}

export default AudioPlayer
