import React, { useCallback, useEffect, useRef } from 'react'

import { UserList } from '../../components'
import { CALL_STATUS, useAuth, useWebRTC } from '../../context'

const constraints = {
  audio: !true,
  video: {
    width: 256,
    height: 256,
  },
}

const WhatsApp = () => {
  const { user } = useAuth()
  const {
    currentCallData,
    getStreamVideo,
    stopStreamedVideo,
    call,
    answer,
    decline,
  } = useWebRTC()
  const localVideoRef = useRef()
  const remoteVideoRef = useRef()

  useEffect(() => {
    if (currentCallData?.status === CALL_STATUS.DECLINE) {
      stopStreamedVideo(localVideoRef.current)
      stopStreamedVideo(remoteVideoRef.current)
    }
  }, [currentCallData])

  const handleCall = useCallback(
    async (callee) => {
      await getStreamVideo({
        localRef: localVideoRef.current,
        remoteRef: remoteVideoRef.current,
      })
      call({
        callee: {
          uid: callee.uid,
          email: callee.email,
        },
      })
    },
    [getStreamVideo, call]
  )

  const handleAnswer = useCallback(async () => {
    await getStreamVideo({
      localRef: localVideoRef.current,
      remoteRef: remoteVideoRef.current,
    })
    answer()
  }, [getStreamVideo, answer])

  const handleDecline = useCallback(() => {
    decline()
  }, [decline])

  return (
    <div>
      WhatsApp
      <UserList handleCall={handleCall} />
      <br />
      {[CALL_STATUS.CALLING, CALL_STATUS.ANSWER].some(
        (status) => status === currentCallData?.status
      ) && (
          <div>
            {((currentCallData?.status === CALL_STATUS.CALLING &&
              currentCallData?.caller?.uid === user?.uid) ||
              currentCallData?.status === CALL_STATUS.ANSWER) && (
                <div>
                  {currentCallData?.caller?.email}
                  <button onClick={handleDecline}>Decline</button>
                </div>
              )}
            {currentCallData?.status === CALL_STATUS.CALLING &&
              currentCallData?.callee?.uid === user?.uid && (
                <div>
                  {currentCallData?.caller?.email}
                  <button onClick={handleDecline}>Decline</button>
                  <button onClick={handleAnswer}>Answer</button>
                </div>
              )}
          </div>
        )}
      <br />
      <video
        ref={localVideoRef}
        style={{
          width: constraints.video.width,
          height: constraints.video.height,
          backgroundColor: 'grey',

          /*Mirror code starts*/
          transform: 'rotateY(180deg)',
          WebkitTransform: 'rotateY(180deg)',
          MozTransformOrigin: 'rotateY(180deg)',
          /*Mirror code ends*/
        }}
        autoPlay
        playsInline
        controls={false}
      />
      <video
        ref={remoteVideoRef}
        style={{
          width: constraints.video.width,
          height: constraints.video.height,
          backgroundColor: 'grey',
          marginLeft: 10,

          /*Mirror code starts*/
          transform: 'rotateY(180deg)',
          WebkitTransform: 'rotateY(180deg)',
          MozTransformOrigin: 'rotateY(180deg)',
          /*Mirror code ends*/
        }}
        autoPlay
        playsInline
        controls={false}
      />
    </div>
  )
}

export default WhatsApp
