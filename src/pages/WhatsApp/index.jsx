// https://webrtc.org/getting-started/firebase-rtc-codelab
// https://fireship.io/lessons/webrtc-firebase-video-chat/
import {
  collection,
  orderBy,
  query,
  where,
  limit,
  onSnapshot,
} from 'firebase/firestore'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { UserList } from '../../components'
import { useAuth } from '../../context'
import { db } from '../../firebase'
import { addDocument, updateDocument } from '../../firebase/service'

const constraints = {
  audio: !true,
  video: {
    width: 256,
    height: 256,
  },
}

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
}

const CALL_STATUS = {
  CALLING: 'calling',
  ACCEPT: 'accept',
  DECLINE: 'decline',
}

const WhatsApp = () => {
  const { user } = useAuth()
  const [currentCallReference, setCurrentCallReference] = useState(null)
  const [callSnapshot, setCallSnapshot] = useState(null)
  const callIdRef = useRef()
  const callSnapshotRef = useRef()
  const localVideoRef = useRef()
  const remoteVideoRef = useRef()
  // const pc = useRef(new RTCPeerConnection(servers))
  const pc = useRef(new RTCPeerConnection())

  const handleGetStreamedVideo = useCallback(async (videoRef) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      videoRef.srcObject = stream
      return stream
    } catch (error) {
      console.log(error)
    }
  }, [])

  const stopStreamedVideo = useCallback((videoRef) => {
    try {
      const stream = videoRef.srcObject
      stream?.getTracks().forEach(function (track) {
        track.stop()
        videoRef.srcObject = null
      })
    } catch (error) {
      console.log(error)
    }
  }, [])

  const handleCall = useCallback(async (callee) => {
    // Step 1
    // console.log('handleCall')
    const offer = await pc.current.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    })
    const callWithOffer = {
      caller: {
        uid: user.uid,
        email: user.email,
      },
      offer: {
        type: offer.type,
        sdp: offer.sdp,
      },
      callee: {
        uid: callee.uid,
        email: callee.email,
      },
      status: CALL_STATUS.CALLING,
    }
    const options = {
      generated: true,
    }
    const callRef = await addDocument('calls', callWithOffer, options)
    // console.log("1", callRef)
    callIdRef.current = callRef.id
    setCurrentCallReference(callRef)

    console.log('Set local description: ', offer)
    await pc.current.setLocalDescription(offer)
  }, [])

  const handleAccept = useCallback(async () => {
    // Step - 6 callee
    if (callSnapshot && currentCallReference) {
      // console.log('handleAccept')
      const offer = callSnapshot.data().offer
      await pc.current.setRemoteDescription(offer)
      const answer = await pc.current.createAnswer()
      await pc.current.setLocalDescription(answer)
      const callWithAnswer = {
        answer: {
          type: answer.type,
          sdp: answer.sdp,
        },
        status: CALL_STATUS.ACCEPT,
      }
      await updateDocument('calls', currentCallReference.id, callWithAnswer)
    }
  }, [callSnapshot, currentCallReference])

  const handleDecline = useCallback(async () => {
    if (currentCallReference) {
      // console.log('handleDecline')
      const callData = {
        status: CALL_STATUS.DECLINE,
      }
      await updateDocument('calls', currentCallReference.id, callData)
      // stopStreamedVideo(localVideoRef.current)
      stopStreamedVideo(remoteVideoRef.current)
    }
  }, [currentCallReference, stopStreamedVideo])

  const handleInitPC = useCallback(async () => {
    const _pc = new RTCPeerConnection(null)

    const stream = await handleGetStreamedVideo(localVideoRef.current)

    // Step 0 add stream to pc
    // add stream for track after set remote description
    stream.getTracks().forEach(function (track) {
      _pc.addTrack(track, stream)
    })

    _pc.onicecandidate = async (e) => {
      if (e.candidate) {
        console.log('onicecandidate---', JSON.stringify(e.candidate))

        // 3a
        const json = e.candidate.toJSON()

        // console.log(callIdRef.current)
        if (
          typeof callSnapshotRef?.current?.data !== 'function' &&
          callIdRef.current &&
          json.sdpMid === '0'
        ) {
          // console.log('Set offer ICE candidate: ', json)
          const callData = {
            offerIceCandidate: json,
          }
          await updateDocument('calls', callIdRef.current, callData)
        }

        if (typeof callSnapshotRef?.current?.data === 'function') {
          const callId = callSnapshotRef?.current?.id
          // const isCaller =
          //   callSnapshotRef?.current?.data().caller.uid === user.uid
          const isCallee =
            callSnapshotRef?.current?.data().callee.uid === user.uid

          // Step - 7 callee
          // console.log('Set answer ICE candidate: ', json)
          if (isCallee) {
            const callData = {
              answerIceCandidate: json,
            }
            await updateDocument('calls', callId, callData)
          }
        }
      }
    }
    _pc.onconnectionstatechange = (e) => {
      // console.log('onconnectionstatechange---', e)
    }
    _pc.ontrack = (e) => {
      // we got remote stream
      // Step - 8 callee
      console.log('Set remote stream', e.streams[0])
      remoteVideoRef.current.srcObject = e.streams[0]
    }

    pc.current = _pc
  }, [])

  useEffect(() => {
    handleInitPC()
  }, [handleInitPC])

  useEffect(() => {
    // Step - 2 caller
    if (currentCallReference) {
      const unsubscribe = onSnapshot(
        currentCallReference,
        { includeMetadataChanges: true },
        async (snapshot) => {
          console.log('Listen my call:', snapshot.data())
          const data = snapshot.data()
          const isCaller = data?.caller?.uid === user.uid
          const isCallee = data?.callee?.uid === user.uid
          if (isCaller || isCallee) {
            callSnapshotRef.current = snapshot
            setCallSnapshot(snapshot)
          }

          // Step - 3 caller
          // Listen for remote answer
          if (
            !pc.current.currentRemoteDescription &&
            data?.answer &&
            isCaller
          ) {
            console.log('Set remote description: ', data.answer)
            const answer = new RTCSessionDescription(data.answer)
            await pc.current.setRemoteDescription(answer)
          }

          // Step - 4 caller
          // Listen for answer ICE candidates
          if (data?.answerIceCandidate && isCaller) {
            console.log('Set answer ICE candidates', data.answerIceCandidate)
            const candidate = new RTCIceCandidate(data.answerIceCandidate)
            pc.current.addIceCandidate(candidate)
          }

          // Listen for offer ICE candidates
          if (data?.offerIceCandidate && isCallee) {
            console.log('Set offer ICE candidates', data.offerIceCandidate)
            const candidate = new RTCIceCandidate(data.offerIceCandidate)
            pc.current.addIceCandidate(candidate)
          }

          // Listen for status
          if (data?.status === CALL_STATUS.DECLINE) {
            stopStreamedVideo(remoteVideoRef.current)
          }
        }
      )
      return () => {
        unsubscribe()
      }
    }
  }, [currentCallReference])

  useEffect(() => {
    // Step - 5 callee
    const incomingCallRef = query(
      collection(db, 'calls'),
      where('callee.uid', '==', user.uid),
      orderBy('callee.uid'),
      orderBy('createdAt', 'desc'),
      limit(1)
    )
    const unsubscribe = onSnapshot(
      incomingCallRef,
      async (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          // console.log(change.doc.id)
          if (change.type === 'added') {
            // console.log('Listen incoming call:', change.doc.data())
            // console.log('New call: ', change.doc.data(), change.doc.ref, change.doc.id)
            const callRef = change.doc.ref
            callSnapshotRef.current = change.doc
            // console.log("2", callRef)
            callIdRef.current = callRef.id
            setCurrentCallReference(callRef)
            setCallSnapshot(change.doc)
          }
          if (change.type === 'modified') {
            // console.log('Modified call: ', change.doc.data())
          }
          if (change.type === 'removed') {
            // console.log('Removed call: ', change.doc.data())
          }
        })
      },
      (error) => {
        console.log(error)
      }
    )
    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <div>
      WhatsApp
      <UserList handleCall={handleCall} />
      <br />
      {[CALL_STATUS.CALLING, CALL_STATUS.ACCEPT].some(
        (status) => status === callSnapshot?.data()?.status
      ) && (
          <div>
            CallId: {callSnapshot?.id}
            <div>
              {((callSnapshot?.data()?.status === CALL_STATUS.CALLING &&
                callSnapshot?.data()?.caller?.uid === user?.uid) ||
                callSnapshot?.data()?.status === CALL_STATUS.ACCEPT) && (
                  <div>
                    {callSnapshot?.data()?.caller?.email}
                    <button onClick={handleDecline}>Decline</button>
                  </div>
                )}
              {callSnapshot?.data()?.status === CALL_STATUS.CALLING &&
                callSnapshot?.data()?.callee?.uid === user?.uid && (
                  <div>
                    {callSnapshot?.data()?.caller?.email}
                    <button onClick={handleDecline}>Decline</button>
                    <button onClick={handleAccept}>Accept</button>
                  </div>
                )}
            </div>
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
      />
    </div>
  )
}

export default WhatsApp
