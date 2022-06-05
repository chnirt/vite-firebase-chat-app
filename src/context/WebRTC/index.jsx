// https://github.com/raymon-zhang/webrtc-react-videochat/blob/master/src/App.js#L35
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { auth, db } from '../../firebase'
import {
  addDocument,
  addSubCollection,
  updateDocument,
} from '../../firebase/service'

export const CALL_STATUS = {
  CALLING: 'calling',
  ANSWER: 'answer',
  DECLINE: 'decline',
}

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
}

if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
  console.log("enumerateDevices() not supported.");
}

// List cameras and microphones.

navigator.mediaDevices.enumerateDevices()
  .then(function (devices) {
    devices.forEach(function (device) {
      console.log(device.kind + ": " + device.label +
        " id = " + device.deviceId);
    });
  })
  .catch(function (err) {
    console.log(err.name + ": " + err.message);
  });

const WebRTCContext = createContext()

export const WebRTCProvider = ({ children }) => {
  const [currentCallReference, setCurrentCallReference] = useState(null)
  const [currentCallData, setCurrentCallData] = useState(null)
  const pc = useRef(new RTCPeerConnection(servers))
  const dc = useRef(null)

  const getStreamVideo = useCallback(async ({ localRef, remoteRef }) => {
    pc.current = new RTCPeerConnection(servers)

    const constraints = { audio: true, video: { facingMode: "user" } }

    const localStream = await navigator.mediaDevices.getUserMedia(constraints)

    const track = localStream.getVideoTracks()[0]
    track.onended = (e) => console.log('Hangup or dropped call')

    localStream.getTracks().forEach((track) => {
      pc.current.addTrack(track, localStream)
    })

    const remoteStream = new MediaStream()

    pc.current.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track)
      })
    }

    // pc.current.ontrack = (e) => {
    //   // we got remote stream
    //   console.log('Set remote stream: ', e.streams[0])
    //   remoteRef.srcObject = e.streams[0]
    // }

    localRef.srcObject = localStream
    remoteRef.srcObject = remoteStream

    if (!auth.currentUser) return
    const user = auth.currentUser

    dc.current = pc.current.createDataChannel(user.uid)

    dc.current.onmessage = function (event) {
      console.log('received: ' + event.data)
    }

    dc.current.onopen = function () {
      console.log('datachannel open')
    }

    dc.current.onclose = function () {
      console.log('datachannel close')
    }
  }, [])

  const stopStreamedVideo = useCallback(async (videoRef) => {
    try {
      const stream = videoRef.srcObject
      const tracks = await stream?.getTracks()
      tracks?.forEach(function (track) {
        track.stop()
        videoRef.srcObject.removeTrack(track)
      })
      videoRef.srcObject = null
    } catch (error) {
      console.log(error)
    }
  }, [])

  const call = useCallback(async ({ callee }) => {
    if (!auth.currentUser) return
    const user = auth.currentUser

    const offerDescription = await pc.current.createOffer()

    const callWithOffer = {
      offer: {
        type: offerDescription.type,
        sdp: offerDescription.sdp,
      },
      caller: {
        uid: user.uid,
        email: user.email,
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
    const callReference = await addDocument('calls', callWithOffer, options)
    setCurrentCallReference(callReference)

    pc.current.onicecandidate = async (event) => {
      if (event.candidate) {
        const json = event.candidate.toJSON()
        const docRef = doc(db, 'calls', callReference.id)
        const offerICECandidatesData = {
          ...json,
          uid: user.uid,
        }
        await addSubCollection(
          docRef,
          'offerICECandidates',
          offerICECandidatesData
        )
      }
    }

    await pc.current.setLocalDescription(offerDescription)

    onSnapshot(callReference, async (doc) => {
      const data = doc.data()
      if (!pc.current.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer)
        pc.current.setRemoteDescription(answerDescription)
      }
    })

    onSnapshot(
      query(collection(callReference, 'answerICECandidates')),
      async (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data()
            const candidate = new RTCIceCandidate(data)
            pc.current.addIceCandidate(candidate)
          }
        })
      }
    )
  }, [])

  const answer = useCallback(async () => {
    if (!currentCallReference) return

    if (!auth.currentUser) return
    const user = auth.currentUser

    pc.current.onicecandidate = async (event) => {
      if (event.candidate) {
        const json = event.candidate.toJSON()
        const docRef = doc(db, 'calls', currentCallReference.id)
        const answerICECandidatesData = {
          ...json,
          uid: user.uid,
        }
        await addSubCollection(
          docRef,
          'answerICECandidates',
          answerICECandidatesData
        )
      }
    }

    const docSnap = await getDoc(currentCallReference)
    const callData = docSnap.data()

    const offerDescription = callData.offer
    await pc.current.setRemoteDescription(
      new RTCSessionDescription(offerDescription)
    )

    const answerDescription = await pc.current.createAnswer()
    await pc.current.setLocalDescription(answerDescription)

    const callWithAnswer = {
      answer: {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      },
      status: CALL_STATUS.ANSWER,
    }
    await updateDocument('calls', currentCallReference.id, callWithAnswer)

    onSnapshot(
      query(collection(currentCallReference, 'offerICECandidates')),
      async (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data()
            const candidate = new RTCIceCandidate(data)
            pc.current.addIceCandidate(candidate)
          }
        })
      }
    )
  }, [currentCallReference?.id])

  const decline = useCallback(async () => {
    if (!currentCallReference) return

    if (!auth.currentUser) return
    const user = auth.currentUser

    const docSnap = await getDoc(currentCallReference)
    const callData = docSnap.data()
    const isCaller = callData.caller.uid === user.uid
    const isCallee = callData.callee.uid === user.uid

    if (isCaller) {
      const q = query(
        collection(currentCallReference, 'offerICECandidates'),
        where('uid', '==', user.uid)
      )

      const querySnapshot = await getDocs(q)
      const docs = querySnapshot.docs
      docs.map(async (doc) => {
        await deleteDoc(doc.ref)
        return { id: doc.id, ...doc.data() }
      })
    }

    if (isCallee) {
      const q = query(
        collection(currentCallReference, 'answerICECandidates'),
        where('uid', '==', user.uid)
      )

      const querySnapshot = await getDocs(q)
      const docs = querySnapshot.docs
      docs.map(async (doc) => {
        await deleteDoc(doc.ref)
        return { id: doc.id, ...doc.data() }
      })
    }

    const updateCallData = {
      status: CALL_STATUS.DECLINE,
    }
    await updateDocument('calls', currentCallReference.id, updateCallData)
    setCurrentCallReference(null)
    dc.current.close()
    pc.current.close()
  }, [currentCallReference?.id])

  useEffect(() => {
    if (!auth.currentUser) return
    const user = auth.currentUser
    const incomingCallRef = query(
      collection(db, 'calls'),
      where('status', '==', CALL_STATUS.CALLING),
      where('callee', '==', {
        uid: user?.uid,
        email: user?.email,
      }),
      where('createdAt', '>=', Timestamp.fromDate(new Date())),
      orderBy('createdAt', 'desc'),
      limit(1)
    )
    const unsubscribe = onSnapshot(
      incomingCallRef,
      async (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const callRef = change.doc.ref
            setCurrentCallReference(callRef)
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

  useEffect(() => {
    if (currentCallReference?.id) {
      const unsubscribeCurrentCall = onSnapshot(
        currentCallReference,
        async (querySnapshot) => {
          const data = {
            id: querySnapshot.id,
            ...querySnapshot.data(),
          }
          console.log(data)
          setCurrentCallData(data)
        }
      )

      // pc.current.onconnectionstatechange = (event) => {
      //   switch (pc.current.connectionState) {
      //     case 'new':
      //     case 'checking':
      //       // setOnlineStatus("Connecting...");
      //       break
      //     case 'connected':
      //       // setOnlineStatus("Online");
      //       break
      //     case 'disconnected':
      //       // setOnlineStatus("Disconnecting...");
      //       decline()
      //       break
      //     case 'closed':
      //       // setOnlineStatus("Offline");
      //       break
      //     case 'failed':
      //       // setOnlineStatus("Error");
      //       break
      //     default:
      //       // setOnlineStatus("Unknown");
      //       break
      //   }
      // }

      return () => {
        unsubscribeCurrentCall()
      }
    }
  }, [currentCallReference?.id, decline])

  const value = useMemo(
    () => ({
      currentCallData,
      getStreamVideo,
      stopStreamedVideo,
      call,
      answer,
      decline,
    }),
    [currentCallData, getStreamVideo, stopStreamedVideo, call, answer, decline]
  )

  return (
    <WebRTCContext.Provider value={value}>{children}</WebRTCContext.Provider>
  )
}

export const useWebRTC = () => useContext(WebRTCContext)
