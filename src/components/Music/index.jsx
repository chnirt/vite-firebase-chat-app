// https://www.youtube.com/watch?v=QTHRWGn_sJw
// https://stackoverflow.com/questions/18389224/how-to-style-html5-range-input-to-have-different-color-before-and-after-slider
// https://thewebdev.info/2021/10/14/how-to-playback-html-audio-with-fade-in-and-fade-out-with-javascript/
import {
  forwardRef,
  Fragment,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import moment from 'moment'
import { colors } from '../../constants'
import { css, keyframes } from '@emotion/react'
import {
  IoIosFastforward,
  IoIosPause,
  IoIosPlay,
  IoIosRewind,
} from 'react-icons/io'
import { Button, Row, Typography } from 'antd'

import SpotifyLogo from '../../assets/logo/spotify_logo.png'

const rotate = keyframes`
  from, 0, to {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
`

export const Music = forwardRef(
  ({ data = [], onStateChange = () => { }, autoplay = false }, ref) => {
    const audioRef = useRef(null)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isPlay, setPlay] = useState(autoplay)
    const [audioIndex, setAudioIndex] = useState(0)

    const handleLoadedData = useCallback(() => {
      setDuration(audioRef.current.duration)
      if (isPlay) audioRef.current.play()
    }, [isPlay])

    const handleTimeUpdate = useCallback(() => {
      setCurrentTime(audioRef.current?.currentTime)
    }, [])

    const handleEnded = useCallback(() => {
      onStateChange(false)
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
    }, [])

    useImperativeHandle(
      ref,
      () => ({
        handleSelect,
        handlePausePlayClick,
        handlePlayClick,
        handleEnded,
      }),
      [handleSelect, handlePausePlayClick, handlePlayClick, handleEnded]
    )

    useEffect(() => {
      audioRef.current.volume = 0
      const fadeAudio = setInterval(() => {
        // console.log(audioRef.current.volume)
        const startPoint = 3
        const endPoint = audioRef.current.duration - startPoint
        if (audioRef.current.currentTime <= startPoint) {
          audioRef.current.volume = Math.min(audioRef.current.volume + 0.1, 1)
        }
        if (audioRef.current.currentTime >= endPoint) {
          audioRef.current.volume = Math.max(audioRef.current.volume - 0.1, 0)
        }
        if (audioRef.current.volume === 0) {
          clearInterval(fadeAudio)
        }
      }, 200)

      return () => {
        clearInterval(fadeAudio)
      }
    }, [])

    const name = data[audioIndex]?.name
    const image = data[audioIndex]?.album?.images[0].url ?? SpotifyLogo
    const previewUrl = data[audioIndex]?.preview_url

    return (
      <Fragment>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            boxShadow: `0 12px 12px 0 ${colors.firebase}30`,
            display: 'flex',
            padding: 20,
            marginTop: 90,
            position: 'relative',
          }}
        >
          <audio
            ref={audioRef}
            src={previewUrl}
            onLoadedData={handleLoadedData}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
          >
            Your browser does not support the
            <code> audio</code> element.
          </audio>

          <div
            css={((isPlay) => css`
              background-color: #ffffff80;
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              margin-left: auto;
              margin-right: auto;
              width: calc(100% - ${8 * 4}px);
              border-radius: 8px 8px 0 0;
              align-self: center;

              ${isPlay
                ? `
                opacity: 1;
                transform: translateY(-100%);
                transition: transform 0.5s ease-in, opacity 0.5s ease-in;
              `
                : `
                opacity: 0;
                transform: translateY(0%);
                transition: transform 0.5s ease-out, opacity 0.5s ease-out;
              `}

              padding: 8px 8px 8px 140px;
            `)(isPlay)}
          >
            <Typography.Title
              style={{
                marginBottom: 0,
              }}
              level={5}
            >
              <marquee scrolldelay={180}>{name}</marquee>
            </Typography.Title>
            <Row justify="space-between">
              <Typography.Paragraph
                style={{ color: colors.border, marginBottom: 0 }}
              >
                {formatSecondToMMSS(Math.floor(currentTime))}
              </Typography.Paragraph>
              <Typography.Paragraph
                style={{ color: colors.border, marginBottom: 0 }}
              >
                {formatSecondToMMSS(Math.floor(duration))}
              </Typography.Paragraph>
            </Row>
            <input
              css={((percent) => css`
                width: 100%;
                -webkit-appearance: none;
                background-color: #76767650;
                height: 5px;
                border-radius: 5px;
                overflow: hidden;
                &::-webkit-slider-runnable-track {
                  -webkit-appearance: none;
                }
                &::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  width: 10px;
                  height: 10px;
                  ${'' /* border-radius: ${10 / 2}px; */}
                  background: #ffffff;
                  box-shadow: -115px 0 0 110px ${colors.spotify};
                }
              `)(Math.floor((currentTime / duration) * 100))}
              type="range"
              value={currentTime}
              onChange={handleTimeSliderChange}
              min={0}
              max={duration}
            />
          </div>
          <div
            css={css`
              position: relative;
              width: 100px;
              aspect-ratio: 2;
              &:after {
                content: '';
                background-color: #ffffff;
                width: ${30}px;
                height: ${30}px;
                border-radius: 50%;
                position: absolute;
                left: calc(50% - ${30 / 2}px);
                top: -${30 / 2}px;
                ${'' /* border: 10px solid #000000; */}
              }
            `}
          >
            <img
              css={((isPlay) => css`
                width: inherit;
                aspect-ratio: 1;
                border-radius: 50%;
                object-fit: cover;
                position: absolute;
                left: 0;
                bottom: 0;

                animation: ${rotate} 6s linear infinite;

                ${isPlay
                  ? `
                animation-play-state: running;
                `
                  : `
                animation-play-state: paused;
                `}
              `)(isPlay)}
              src={image}
            />
          </div>

          <div
            css={css`
              display: flex;
              align-items: center;
              justify-content: center;
            `}
          >
            <Button
              style={{
                border: 0,
                boxShadow: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 20px',
              }}
              ghost
              shape="circle"
              icon={<IoIosRewind size={20} color={colors.spotify} />}
              onClick={handlePrev}
            />
            <Button
              style={{
                border: 0,
                boxShadow: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 20px',
              }}
              ghost
              shape="circle"
              icon={
                isPlay ? (
                  <IoIosPause size={30} color={colors.spotify} />
                ) : (
                  <IoIosPlay size={30} color={colors.spotify} />
                )
              }
              onClick={handlePausePlayClick}
            />
            <Button
              style={{
                border: 0,
                boxShadow: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 20px',
              }}
              ghost
              shape="circle"
              icon={
                <IoIosFastforward
                  size={20}
                  color={colors.spotify}
                // color={isSelected ? colors.spotify : '#767676'}
                // fill={isSelected ? colors.spotify : '#767676'}
                />
              }
              onClick={handleNext}
            />
          </div>
        </div>

        {/* <audio
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
        /> */}
      </Fragment>
    )
  }
)
