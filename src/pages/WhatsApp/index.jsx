// https://webrtc.org/getting-started/firebase-rtc-codelab
// https://fireship.io/lessons/webrtc-firebase-video-chat/
import {
  collection,
  orderBy,
  query,
  where,
  limit,
  onSnapshot,
  doc,
} from 'firebase/firestore'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { UserList } from '../../components'
import { useAuth } from '../../context'
import { db } from '../../firebase'
import {
  addDocument,
  // addSubCollection,
  updateDocument,
} from '../../firebase/service'

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
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
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
  const [callDocument, setCallDocument] = useState(null)
  const localVideoRef = useRef()
  const remoteVideoRef = useRef()
  const pc = useRef(new RTCPeerConnection(servers))

  const handleGetStreamedVideo = useCallback(async (videoRef) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      videoRef.srcObject = stream
      // add stream for track after set remote description
      stream.getTracks().forEach(function (track) {
        pc.current.addTrack(track, stream)
      })

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
    // console.log('handleCall')
    console.log('PC open: ')
    pc.current = new RTCPeerConnection(servers)

    await handleGetStreamedVideo(localVideoRef.current)

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
    console.log('Save offer: ')
    const callRef = await addDocument('calls', callWithOffer, options)
    setCurrentCallReference(callRef)

    pc.current.onicecandidate = async (event) => {
      if (event.candidate) {
        const json = event.candidate.toJSON()
        if (json.sdpMid !== '0' && json.sdpMLineIndex !== 0) return
        const docRef = doc(db, 'calls', callRef.id)
        const offerICECandidatesData = {
          ...json,
          uid: user.uid,
        }

        console.log('Save offer ICE candidates: ')
        // v2
        // await addSubCollection(
        //   docRef,
        //   'offerICECandidates',
        //   offerICECandidatesData
        // )

        // v1
        const callData = {
          offerIceCandidate: json,
        }
        await updateDocument('calls', callRef.id, callData)
      }
    }

    console.log('Set offer to local description: ', offer)
    await pc.current.setLocalDescription(offer)
  }, [])

  const handleAccept = useCallback(async () => {
    if (currentCallReference && callDocument) {
      // console.log('handleAccept')
      // pc.current = new RTCPeerConnection(servers)

      await handleGetStreamedVideo(localVideoRef.current)

      pc.current.onicecandidate = async (event) => {
        if (event.candidate) {
          const json = event.candidate.toJSON()
          if (json.sdpMid !== '0' && json.sdpMLineIndex !== 0) return
          const docRef = doc(db, 'calls', currentCallReference.id)
          const answerICECandidatesData = {
            ...json,
            uid: user.uid,
          }

          console.log('Save answer ICE candidates: ')
          // v2
          // await addSubCollection(
          //   docRef,
          //   'answerICECandidates',
          //   answerICECandidatesData
          // )

          // v1
          const callData = {
            answerIceCandidate: json,
          }
          await updateDocument('calls', currentCallReference.id, callData)
        }
      }

      const offer = callDocument.offer
      console.log('Set remote offer to remote description: ')
      await pc.current.setRemoteDescription(offer)

      const answer = await pc.current.createAnswer()
      console.log('Set local answer to local description: ')
      await pc.current.setLocalDescription(answer)

      const callWithAnswer = {
        answer: {
          type: answer.type,
          sdp: answer.sdp,
        },
        status: CALL_STATUS.ACCEPT,
      }
      console.log('Save answer: ')
      await updateDocument('calls', currentCallReference.id, callWithAnswer)
    }
  }, [currentCallReference, callDocument])

  const handleDecline = useCallback(async () => {
    if (currentCallReference) {
      // console.log('handleDecline')
      const callData = {
        status: CALL_STATUS.DECLINE,
      }
      await updateDocument('calls', currentCallReference.id, callData)
    }
  }, [currentCallReference, stopStreamedVideo])

  useEffect(() => {
    if (currentCallReference) {
      const unsubscribeCall = onSnapshot(
        currentCallReference,
        { includeMetadataChanges: true },
        async (querySnapshot) => {
          const data = querySnapshot.data()
          const isCaller = data?.caller?.uid === user.uid
          const isCallee = data?.callee?.uid === user.uid
          setCallDocument(data)

          // if (data && isCaller) {
          //   console.log('Added incoming call: ', data)
          //   // setCurrentCallReference(callRef)
          //   setCallDocument(data)

          //   // console.log('PC Start: ')
          //   // pc.current = new RTCPeerConnection(servers)
          // }

          // Listen for remote answer
          if (
            !pc.current.currentRemoteDescription &&
            data?.answer &&
            isCaller
          ) {
            console.log('Set answer to remote description: ', data.answer)
            const answer = new RTCSessionDescription(data.answer)
            await pc.current.setRemoteDescription(answer)
          }

          // Listen for answer ICE candidates
          if (
            pc.current.signalingState !== 'closed' &&
            data?.answerIceCandidate &&
            isCaller
          ) {
            console.log('Set answer ICE candidates', data.answerIceCandidate)
            const candidate = new RTCIceCandidate(data.answerIceCandidate)
            pc.current.addIceCandidate(candidate)
          }

          console.log(pc.current.signalingState)

          // Listen for offer ICE candidates
          if (
            pc.current.signalingState !== 'closed' &&
            data?.offerIceCandidate &&
            isCallee
          ) {
            console.log('Set offer ICE candidates', data.offerIceCandidate)
            const candidate = new RTCIceCandidate(data.offerIceCandidate)
            pc.current.addIceCandidate(candidate)
          }

          // Listen for track
          pc.current.ontrack = (e) => {
            // we got remote stream
            console.log('Set remote stream: ', e.streams[0])
            remoteVideoRef.current.srcObject = e.streams[0]
          }

          // Listen for status
          if (
            pc.current.signalingState === 'stable' &&
            data?.status === CALL_STATUS.DECLINE
          ) {
            stopStreamedVideo(localVideoRef.current)
            stopStreamedVideo(remoteVideoRef.current)
            console.log('PC close: ')
            pc.current.close()
            // if (isCallee) {
            //   setCallDocument(data)
            // }
          }
        }
      )
      const unsubscribeAnswerICECandidates = onSnapshot(
        query(
          collection(currentCallReference, 'answerICECandidates'),
          limit(1)
        ),
        async (querySnapshot) => {
          querySnapshot.docChanges().forEach((change) => {
            const data = change.doc.data()
            const isCaller = data?.caller?.uid === user.uid
            // const isCallee = data?.callee?.uid === user.uid
            if (change.type === 'added') {
              if (data && isCaller) {
                // console.log('Added answerICECandidates: ', data)
                // const candidate = new RTCIceCandidate(data)
                // pc.current.addIceCandidate(candidate)
              }
            }
            // if (change.type === 'modified') {
            //   console.log('Modified answerIceCandidates: ', data)
            // }
            // if (change.type === 'removed') {
            //   console.log('Removed answerIceCandidates: ', data)
            // }
          })
        }
      )
      const unsubscribeOfferICECandidates = onSnapshot(
        query(collection(currentCallReference, 'offerICECandidates'), limit(1)),
        async (querySnapshot) => {
          querySnapshot.docChanges().forEach((change) => {
            const data = change.doc.data()
            // const isCaller = data?.caller?.uid === user.uid
            const isCallee = data?.callee?.uid === user.uid
            if (change.type === 'added') {
              if (data && isCallee) {
                // console.log('Added offerIceCandidates: ', data)
                // const candidate = new RTCIceCandidate(data)
                // pc.current.addIceCandidate(candidate)
              }
            }
            // if (change.type === 'modified') {
            //   console.log('Modified offerIceCandidates: ', data)
            // }
            // if (change.type === 'removed') {
            //   console.log('Removed offerIceCandidates: ', data)
            // }
          })
        }
      )
      return () => {
        unsubscribeCall()
        unsubscribeAnswerICECandidates()
        unsubscribeOfferICECandidates()
      }
    }
  }, [currentCallReference])

  useEffect(() => {
    const incomingCallRef = query(
      collection(db, 'calls'),
      where('status', '==', CALL_STATUS.CALLING),
      where('callee', '==', {
        uid: user.uid,
        email: user.email
      }),
      orderBy('createdAt', 'desc'),
      limit(1)
    )
    const unsubscribe = onSnapshot(
      incomingCallRef,
      async (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          const data = change.doc.data()
          const callRef = change.doc.ref
          // const isCaller = data?.caller?.uid === user.uid
          const isCallee = data?.callee?.uid === user.uid
          if (change.type === 'added') {
            if (data && isCallee) {
              console.log('Added incoming call: ', data)
              setCurrentCallReference(callRef)
              setCallDocument(data)

              console.log('PC Start: ')
              pc.current = new RTCPeerConnection(servers)
            }
          }
          // if (change.type === 'modified') {
          //   console.log('Modified incoming call: ', data)
          // }
          // if (change.type === 'removed') {
          //   console.log('Removed incoming call: ', data)
          // }
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
        (status) => status === callDocument?.status
      ) && (
          <div>
            {((callDocument?.status === CALL_STATUS.CALLING &&
              callDocument?.caller?.uid === user?.uid) ||
              callDocument?.status === CALL_STATUS.ACCEPT) && (
                <div>
                  {callDocument?.caller?.email}
                  <button onClick={handleDecline}>Decline</button>
                </div>
              )}
            {callDocument?.status === CALL_STATUS.CALLING &&
              callDocument?.callee?.uid === user?.uid && (
                <div>
                  {callDocument?.caller?.email}
                  <button onClick={handleDecline}>Decline</button>
                  <button onClick={handleAccept}>Accept</button>
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
