import {
  collection,
  orderBy,
  query,
  where,
  limit,
} from 'firebase/firestore'
import React, { useCallback, useEffect, useRef } from 'react'
import { useCollection } from 'react-firebase-hooks/firestore'

import { UserList } from '../../components'
import { useAuth } from '../../context'
import { db } from '../../firebase'
import { addDocument, deleteDocument, updateDocument } from '../../firebase/service'

const constraints = {
  audio: true,
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

const WhatsApp = () => {
  const { user } = useAuth()
  const [calleeValue, loading, error] = useCollection(
    query(
      collection(db, 'calls'),
      where('callee', '==', user.uid),
      orderBy('callee'),
      orderBy('createdAt', 'desc'),
      limit(1)
    ),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  )
  const [callerValue] = useCollection(
    query(
      collection(db, 'calls'),
      where('caller', '==', user.uid),
      orderBy('caller'),
      orderBy('createdAt', 'desc'),
      limit(1)
    ),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  )
  const localVideoRef = useRef()
  const remoteVideoRef = useRef()
  // const pc = useRef(new RTCPeerConnection(null))
  const pc = useRef(new RTCPeerConnection(servers))
  const textRef = useRef()

  const callee = calleeValue?.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))[0]
  const caller = callerValue?.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))[0]

  const handleGetStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      return stream
    } catch (error) { }
  }, [])

  const handleStopStream = useCallback(async (stream) => {
    stream.getTracks().forEach(function (track) {
      track.stop()
    })
    await deleteDocument('calls', caller.id)
  }, [caller?.id])

  const createOffer = useCallback(async () => {
    try {
      const sdp = await pc.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })
      pc.current.setLocalDescription(sdp)
      const stringifySdp = JSON.stringify(sdp)
      // console.log(stringifySdp)
      return stringifySdp
    } catch (error) {
      console.log(error)
    }
  }, [])

  const createAnswer = useCallback(async () => {
    try {
      const sdp = await pc.current.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })
      pc.current.setLocalDescription(sdp)
      const stringifySdp = JSON.stringify(sdp)
      return stringifySdp
    } catch (error) {
      console.log(error)
    }
  }, [])

  const setRemoteDescription = useCallback(() => {
    // get sdp from textarea
    const sdp = JSON.parse(textRef.current.value)
    // console.log(sdp)
    pc.current.setRemoteDescription(new RTCSessionDescription(sdp))
  }, [])

  const addCandidate = useCallback(() => {
    const candidate = JSON.parse(textRef.current.value)
    // console.log('Adding Candidate...', candidate)
    pc.current.addIceCandidate(new RTCIceCandidate(candidate))
  }, [])

  const handleCall = useCallback(async (uid) => {
    if (user?.id === null) return
    const offerSdp = await createOffer()
    const callData = {
      offerSdp,
      // answerSdp,
      caller: user.uid,
      callee: uid,
    }
    await addDocument('calls', callData)
  }, [])

  const handleAccept = useCallback(async () => {
    if (callee?.offerSdp) {
      textRef.current.value = callee.offerSdp
      setRemoteDescription()
      const answerSdp = await createAnswer()
      const callData = {
        answerSdp,
      }
      await updateDocument('calls', callee.id, callData)
    }
  }, [callee, updateDocument])

  const handleOnIceAndCandidate = useCallback(async (candidate) => {
    if (callee?.id) {
      const stringifyCandidate = JSON.stringify(candidate)
      const callData = {
        candidate: stringifyCandidate,
      }
      // console.log(callee.id, callData)
      await updateDocument('calls', callee.id, callData)
    }
  }, [callee])


  useEffect(() => {
    const handleSomething = async () => {
      const _pc = new RTCPeerConnection(null)

      const stream = await handleGetStream()
      localVideoRef.current.srcObject = stream

      // add stream for track after set remote description
      stream.getTracks().forEach(function (track) {
        _pc.addTrack(track, stream)
      })

      _pc.onicecandidate = (e) => {
        if (e.candidate) {
          console.log('onicecandidate---', JSON.stringify(e.candidate))
          handleOnIceAndCandidate(e.candidate)
        }
      }
      _pc.onconnectionstatechange = (e) => {
        console.log('onconnectionstatechange---', e)
      }
      _pc.ontrack = (e) => {
        // we got remote stream
        remoteVideoRef.current.srcObject = e.streams[0]
      }

      pc.current = _pc
    }
    handleSomething()
  }, [handleOnIceAndCandidate])

  useEffect(() => {
    if (caller?.answerSdp) {
      textRef.current.value = caller.answerSdp
      setRemoteDescription()
    }
  }, [caller?.answerSdp])

  useEffect(() => {
    if (caller?.candidate) {
      textRef.current.value = caller.candidate
      addCandidate()
    }
  }, [caller?.candidate])

  return (
    <div>
      WhatsApp
      <UserList handleCall={handleCall} />
      <br />
      {callee && (
        <div>
          {callee.caller}
          <button onClick={handleAccept}>Accept</button>
        </div>
      )}
      <br />
      <button
        onClick={async () => {
          localVideoRef.current.srcObject = await handleGetStream()
        }}
      >
        Get Stream
      </button>
      <button onClick={() => handleStopStream(localVideoRef.current.srcObject)}>
        Cancel Stream
      </button>
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
      <br />
      <button onClick={createOffer}>Create Offer</button>
      <br />
      <button onClick={createAnswer}>Create Answer</button>
      <br />
      <textarea ref={textRef}></textarea>
      <br />
      <button onClick={setRemoteDescription}>Set Remote Description</button>
      <br />
      <button onClick={addCandidate}>Add Candidate</button>
    </div>
  )
}

export default WhatsApp
