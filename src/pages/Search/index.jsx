import { useCallback, useState, useEffect } from 'react'
import moment from 'moment'
import { Link } from 'react-router-dom'
import {
  arrayRemove,
  arrayUnion,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
} from 'firebase/firestore'

import { useFetch } from '../../firebase/hooks'
import {
  deleteDocument,
  getBatch,
  getColRef,
  getDocRef,
} from '../../firebase/service'
import { useAuth } from '../../context'

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
  const [search, setSearch] = useState('')
  const [followList, setFollowList] = useState([])

  const handleFollow = useCallback(
    async (doc) => {
      // follower
      // const followerDocRef = getDocRef('users', user.uid)
      const followingData = {
        email: doc.email,
        uid: doc.uid,
      }
      const followerDocRef = getDocRef('users', user.uid, 'following', doc.uid)
      await setDoc(followerDocRef, followingData)

      // followee
      // const followeeDocRef = doc.ref
      const followerData = {
        email: user.email,
        uid: user.uid,
      }
      const followeeDocRef = getDocRef('users', doc.uid, 'follower', user.uid)
      await setDoc(followeeDocRef, followerData)

      // add relationship
      const batch = getBatch()
      const getQuery = query(getColRef('blogs'), where('uid', '==', doc.uid))
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
              return (
                <div
                  key={doc.id}
                  style={{
                    border: 'solid 1px black',
                    margin: 8,
                    // display: 'flex',
                    // flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Link to={`/user/${doc.uid}`}>@{doc.uid}</Link>
                  <p>{doc.email}</p>
                  <p>{moment(doc.createdAt?.toDate()).fromNow()}</p>
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
