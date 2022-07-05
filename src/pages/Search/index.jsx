import { useCallback, useState, useEffect } from 'react'
import moment from 'moment'
import { Link, useNavigate } from 'react-router-dom'
import {
  arrayRemove,
  arrayUnion,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore'

import { useFetch } from '../../firebase/hooks'
import {
  addDocument,
  deleteDocument,
  getBatch,
  getColRef,
  getDocRef,
} from '../../firebase/service'
import { useAuth } from '../../context'
import { paths } from '../../constants'

const Search = () => {
  const { user } = useAuth()
  const {
    loading,
    data: users,
    fetchData,
    moreLoading,
    loadedAll,
    handleLoadMore,
  } = useFetch('users', 3)
  let navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [followList, setFollowList] = useState([])
  const [relationshipList, setRelationshipList] = useState([])

  const getRelationship = useCallback(async () => {
    const followerDocRef = getColRef('users', user.uid, 'following')
    const q = query(followerDocRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    const docs = querySnapshot.docs
    const data = docs.map((docSnapshot) => {
      return {
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }
    })
    setRelationshipList(data)
    return data
  }, [user?.uid])

  const findRelationship = useCallback(
    (uid) => {
      const foundRelationship = relationshipList.find(
        (item) => item.uid === uid
      )
      if (!foundRelationship) return
      return foundRelationship
    },
    [relationshipList]
  )

  const handleFollow = useCallback(
    async (doc) => {
      // follower
      // const followerDocRef = getDocRef('users', user.uid)
      const followingData = {
        type: 'followee',
        username: doc.username,
        uid: doc.uid,
      }
      const followerDocRef = getDocRef('users', user.uid, 'following', doc.uid)
      await addDocument(followerDocRef, followingData)

      // followee
      // const followeeDocRef = doc.ref
      const followerData = {
        type: 'follower',
        username: user.username,
        uid: user.uid,
      }
      const followeeDocRef = getDocRef('users', doc.uid, 'follower', user.uid)
      await addDocument(followeeDocRef, followerData)

      // add relationship
      const batch = getBatch()
      const blogDocRef = getColRef('blogs')
      const getQuery = query(blogDocRef, where('uid', '==', doc.uid))
      const querySnapshot = await getDocs(getQuery)
      querySnapshot.forEach((docSnapshot) => {
        const docRef = docSnapshot.ref
        batch.update(docRef, {
          relationship: arrayUnion(user.uid),
        })
      })

      await batch.commit()
    },
    [user]
  )

  const handleUnFollow = useCallback(
    async (doc) => {
      // follower
      const followerDocRef = getDocRef('users', user.uid, 'following', doc.uid)
      const followerDocSnap = await getDoc(followerDocRef)
      // console.log(followerDocSnap.data())
      if (followerDocSnap.exists()) {
        await deleteDocument('users', user.uid, 'following', doc.uid)
      }

      // followee
      const followeeDocRef = getDocRef('users', doc.uid, 'follower', user.uid)
      const followeeDocSnap = await getDoc(followeeDocRef)
      // console.log(followeeDocSnap.data())
      if (followeeDocSnap.exists()) {
        await deleteDocument('users', doc.uid, 'follower', user.uid)
      }

      // remove relationship
      const batch = getBatch()
      const getQuery = query(getColRef('blogs'), where('uid', '==', doc.uid))
      const querySnapshot = await getDocs(getQuery)
      querySnapshot.forEach((docSnapshot) => {
        const docRef = docSnapshot.ref
        batch.update(docRef, {
          relationship: arrayRemove(user.uid),
        })
      })

      await batch.commit()
    },
    [user]
  )

  const handleMessage = useCallback(
    async (doc) => {
      const chatData = {
        members: [user.uid, doc.uid],
        uid: user.uid,
      }
      const q = query(
        getColRef('chats'),
        where('members', 'in', [chatData.members])
      )
      const querySnapshot = await getDocs(q)
      const docs = querySnapshot.docs
      const data = docs.map((docSnapshot) => {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }
      })
      const foundChat = data[0]
      if (!foundChat) {
        const chatDocRef = getColRef('chats')
        await addDocument(chatDocRef, chatData)
      }
      navigate(`../${paths.messenger}`)
    },
    [navigate]
  )

  useEffect(() => {
    const formatSearch = search.trim().toLowerCase()
    fetchData(formatSearch.length ? formatSearch : null)
  }, [search])

  useEffect(() => {
    if (!user) return
    const followerDocRef = getColRef('users', user.uid, 'following')
    const unsubscribe = onSnapshot(
      followerDocRef,
      async (querySnapshot) => {
        const data = querySnapshot.docs.map((docSnapshot) => {
          return {
            id: docSnapshot.id,
            ...docSnapshot.data(),
          }
        })
        setFollowList(data)
      },
      (error) => {
        console.log(error)
      }
    )
    return () => {
      unsubscribe()
    }
  }, [user])

  useEffect(() => {
    getRelationship()
  }, [getRelationship])

  return (
    <div>
      Search
      <br />
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      <br />
      <div
        style={{
          height: 500,
          overflowY: 'scroll',
          paddingTop: 8,
          paddingBottom: 8,
          border: 'solid 1px black',
        }}
      >
        {loading && <span>Collection: Loading...</span>}
        {users.length > 0 && (
          <div>
            {users.map((doc) => {
              const isOwner = doc.uid === user.uid
              const isFollowing = followList.some(
                (item) => item.uid === doc.uid
              )
              const id = doc.id
              const email = doc.email
              const createdAt = doc.createdAt
              const foundRelationship = findRelationship(doc.uid)
              const username = foundRelationship?.username
              return (
                <div
                  key={`user-${id}`}
                  style={{
                    border: 'solid 1px black',
                    margin: 8,
                    // display: 'flex',
                    // flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Link to={`/user/${username}`}>@{username}</Link>
                  <p>{email}</p>
                  <p>{moment(createdAt?.toDate()).fromNow()}</p>
                  {!isOwner && (
                    <div>
                      {!isFollowing ? (
                        <button onClick={() => handleFollow(doc)}>
                          follow
                        </button>
                      ) : (
                        <button onClick={() => handleUnFollow(doc)}>
                          following
                        </button>
                      )}
                      <button onClick={() => handleMessage(doc)}>
                        message
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
        {!loadedAll ? (
          moreLoading ? (
            <span>Collection: Loading...</span>
          ) : (
            <button onClick={handleLoadMore}>Load more</button>
          )
        ) : null}
      </div>
    </div>
  )
}

export default Search
