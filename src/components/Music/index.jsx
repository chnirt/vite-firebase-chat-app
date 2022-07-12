import {
  forwardRef,
  Fragment,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import moment from 'moment'

export const Music = forwardRef(
  ({ data = [], onStateChange = () => { } }, ref) => {
    const audioRef = useRef(null)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isPlay, setPlay] = useState(false)
    const [audioIndex, setAudioIndex] = useState(0)

    const handleLoadedData = useCallback(() => {
      setDuration(audioRef.current.duration)
      if (isPlay) audioRef.current.play()
    }, [isPlay])

    const handleTimeUpdate = useCallback(() => {
      setCurrentTime(audioRef.current?.currentTime)
    }, [])

    const handleEnded = useCallback(() => {
      setPlay(false)
    }, [])

    const handlePausePlayClick = useCallback(() => {
      if (isPlay) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      onStateChange(!isPlay)
      setPlay(!isPlay)
    }, [isPlay])

    const handlePlayClick = useCallback(() => {
      audioRef.current.play()
      onStateChange(true)
      setPlay(true)
    }, [])

    const handleTimeSliderChange = useCallback(
      (e) => {
        audioRef.current.currentTime = e.target.value
        setCurrentTime(value)

        if (!isPlay) {
          setPlay(true)
          audioRef.current.play()
        }
      },
      [isPlay]
    )

    const handlePrev = useCallback(() => {
      setAudioIndex((prevState) => Math.max(prevState - 1, 0))
    }, [])

    const handleNext = useCallback(() => {
      setAudioIndex((prevState) => Math.min(prevState + 1, data.length - 1))
    }, [data])

    const formatSecondToMMSS = useCallback(
      (second) => moment.utc(second * 1000).format('mm:ss'),
      []
    )

    const handleSelect = useCallback(async (ii) => {
      setAudioIndex(ii)
      // audioRef.current.play()
      // onStateChange(true)
      // setPlay(true)
    }, [])

    useImperativeHandle(
      ref,
      () => ({
        handleSelect,
        handlePausePlayClick,
        handlePlayClick
      }),
      [handleSelect, handlePausePlayClick, handlePlayClick]
    )

    return (
      <Fragment>
        <audio
          ref={audioRef}
          src={data[audioIndex]?.preview_url}
          onLoadedData={handleLoadedData}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        >
          Your browser does not support the
          <code> audio</code> element.
        </audio>
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
          onChange={handleTimeSliderChange}
          min={0}
          max={duration}
        />
      </Fragment>
    )
  }
)
