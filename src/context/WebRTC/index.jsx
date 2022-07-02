// https://github.com/raymon-zhang/webrtc-react-videochat/blob/master/src/App.js#L35
// https://blog.logrocket.com/creating-rn-video-calling-app-react-native-webrtc/
// https://gabrieltanner.org/blog/turn-server/
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
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
import { auth, db } from '../../firebase'
import {
  addDocument,
  addSubCollection,
  updateDocument,
} from '../../firebase/service'
import { TURN_CREDENTIALS, TURN_URLS, TURN_USERNAME } from '../../env'

export const CALL_STATUS = {
  CALLING: 'calling',
  ANSWER: 'answer',
  DECLINE: 'decline',
}

export const CONSTRAINTS = {
  audio: !true,
  video: {
    facingMode: 'user',
    width: 256,
    height: 256,
  },
}

const WebRTCContext = createContext()

export const WebRTCProvider = ({
  children,
  navigatorConfig,
  enableTurnServer,
}) => {
  const servers = {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302'],
      },
      ...(enableTurnServer
        ? [
          {
            urls: TURN_URLS,
            username: TURN_USERNAME,
            credential: TURN_CREDENTIALS,
          },
        ]
        : []),
    ],
    iceCandidatePoolSize: 10,
  }

  const [currentCallReference, setCurrentCallReference] = useState(null)
  const [currentCallData, setCurrentCallData] = useState(null)
  const pc = useRef(
    navigatorConfig
      ? new navigatorConfig.RTCPeerConnection(servers)
      : new RTCPeerConnection(servers)
  )

  const getStreamVideo = useCallback(
    async ({ handleLocalVideo, handleRemoteVideo }) => {
      pc.current = navigatorConfig
        ? new navigatorConfig.RTCPeerConnection(servers)
        : new RTCPeerConnection(servers)

      let localStream

      if (navigatorConfig) {
        localStream = await navigatorConfig?.mediaDevices?.getUserMedia(
          CONSTRAINTS
        )
      } else {
        localStream = await navigator.mediaDevices.getUserMedia(CONSTRAINTS)
      }

      localStream.getTracks().forEach((track) => {
        if (navigatorConfig) {
          pc.current.addStream(localStream)
          pc.current.getLocalStreams()[0]?.addTrack(track)
        } else {
          pc.current.addTrack(track, localStream)
        }
      })

      const remoteStream = navigatorConfig
        ? new navigatorConfig.MediaStream()
        : new MediaStream()

      if (navigatorConfig) {
        pc.current.onaddstream = (event) => {
          handleRemoteVideo(event.stream)
        }
      } else {
        pc.current.ontrack = (event) => {
          event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track)
          })
        }
      }

      pc.current.onconnectionstatechange = (event) => {
        // console.log('pc.current.connectionState---', pc.current.connectionState)
        switch (pc.current.connectionState) {
          case 'new':
          case 'checking':
            // setOnlineStatus("Connecting...");
            break
          case 'connected':
            // setOnlineStatus("Online");
            break
          case 'disconnected':
            // setOnlineStatus("Disconnecting...");
            // decline()
            break
          case 'closed':
            // setOnlineStatus("Offline");
            break
          case 'failed':
            // setOnlineStatus("Error");
            break
          default:
            // setOnlineStatus("Unknown");
            break
        }
      }

      handleLocalVideo(localStream)
      handleRemoteVideo(remoteStream)
    },
    []
  )

  const stopStreamedVideo = useCallback(async ({ stream, handleStream }) => {
    try {
      const tracks = await stream?.getTracks()
      tracks?.forEach(function (track) {
        track.stop()
        if (!navigatorConfig) {
          stream.removeTrack(track)
        }
      })
      handleStream(null)
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
        const answerDescription = navigatorConfig
          ? new navigatorConfig.RTCSessionDescription(data.answer)
          : new RTCSessionDescription(data.answer)
        pc.current.setRemoteDescription(answerDescription)
      }
    })

    onSnapshot(
      collection(callReference, 'answerICECandidates'),
      async (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data()
            const candidate = navigatorConfig
              ? new navigatorConfig.RTCIceCandidate(data)
              : new RTCIceCandidate(data)
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
      navigatorConfig
        ? new navigatorConfig.RTCSessionDescription(offerDescription)
        : new RTCSessionDescription(offerDescription)
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
      collection(currentCallReference, 'offerICECandidates'),
      async (querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data()
            const candidate = navigatorConfig
              ? new navigatorConfig.RTCIceCandidate(data)
              : new RTCIceCandidate(data)
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
    pc.current.close()
  }, [currentCallReference?.id])

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return
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
          setCurrentCallData(data)
        }
      )
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
