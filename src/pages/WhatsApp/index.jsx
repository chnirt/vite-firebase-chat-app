import { useCallback, useEffect, useRef } from 'react'

import { UserList } from '../../components'
import { eventNames } from '../../constants'
import { CALL_STATUS, CONSTRAINTS, useAuth, useWebRTC } from '../../context'
import { logAnalyticsEvent } from '../../firebase/analytics'

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

  const handleLocalVideo = useCallback((stream) => {
    localVideoRef.current.srcObject = stream
  }, [])

  const handleRemoteVideo = useCallback((stream) => {
    remoteVideoRef.current.srcObject = stream
  }, [])

  const handleCall = useCallback(
    async (callee) => {
      await getStreamVideo({
        handleLocalVideo,
        handleRemoteVideo,
      })

      call({
        callee: {
          uid: callee.uid,
          email: callee.email,
        },
      })

      logAnalyticsEvent(eventNames.call, {
        caller: user.uid,
        callee: callee.uid
      })
    },
    [getStreamVideo, handleLocalVideo, handleRemoteVideo, call, logAnalyticsEvent]
  )

  const handleAnswer = useCallback(async () => {
    await getStreamVideo({
      handleLocalVideo,
      handleRemoteVideo,
    })

    answer()

    logAnalyticsEvent(eventNames.answer, {
      userId: user.uid,
    })
  }, [getStreamVideo, answer, logAnalyticsEvent])

  const handleDecline = useCallback(() => {
    decline()

    logAnalyticsEvent(eventNames.decline, {
      userId: user.uid,
    })
  }, [decline, logAnalyticsEvent])

  useEffect(() => {
    if (currentCallData?.status === CALL_STATUS.DECLINE) {
      stopStreamedVideo({
        stream: localVideoRef.current.srcObject,
        handleStream: handleLocalVideo
      })
      stopStreamedVideo({
        stream: remoteVideoRef.current.srcObject,
        handleStream: handleRemoteVideo
      })
    }
  }, [currentCallData])

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
          width: CONSTRAINTS.video.width,
          height: CONSTRAINTS.video.height,
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
          width: CONSTRAINTS.video.width,
          height: CONSTRAINTS.video.height,
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
