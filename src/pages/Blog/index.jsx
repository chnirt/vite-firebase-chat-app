// https://medium.com/firebase-tips-tricks/how-to-combined-two-firestore-queries-to-simulate-a-logical-or-query-27d28a43cb2d
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  // collection,
  query,
  orderBy,
  limit,
  // getDocs,
  startAfter,
  onSnapshot,
  where,
  getDoc,
  setDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  getDocs,
} from 'firebase/firestore'
import moment from 'moment'

import { useAuth } from '../../context'
import { deleteDocument, getColRef, getDocRef } from '../../firebase/service'

const LIMIT = 3

const Blog = () => {
  let navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [blogs, setBlogs] = useState([])
  const [last, setLast] = useState(null)
  const [moreLoading, setMoreLoading] = useState(false)
  const [loadedAll, setLoadedAll] = useState(false)

  const [likeList, setLikeList] = useState([])

  const getRelationship = useCallback(async () => {
    const followerDocRef = getColRef('users', user.uid, 'following')
    const querySnapshot = await getDocs(followerDocRef)
    const docs = querySnapshot.docs
    const data = docs.map((docSnapshot) => {
      return {
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }
    })
    const followingRelationship = data.map((item) => `${user.uid}_${item.id}`)
    const userRelationship = [`${user.uid}_${user.uid}`]
    const relationship = []
      .concat(userRelationship)
      .concat(followingRelationship)
    return relationship
  }, [])

  const fetchBlogs = useCallback(async () => {
    if (user?.uid === null) return

    const limitNumber = LIMIT + 1

    const relationship = await getRelationship()

    // Query the first page of docs
    const first = query(
      getColRef('blogs'),
      ...(relationship.length > 0
        ? [where('relationship', 'array-contains-any', relationship)]
        : []),
      orderBy('createdAt', 'desc'),
      limit(limitNumber)
    )

    onSnapshot(first, (querySnapshot) => {
      const docs = querySnapshot.docs.slice(0, LIMIT)
      const data = docs.map((docSnapshot) => {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }
      })
      setBlogs(data)

      const lastVisible = docs[docs.length - 1]
      setLast(lastVisible)

      const size = querySnapshot.size
      setLoadedAll(size < limitNumber)
    })
  }, [getRelationship])

  const fetchMoreBlogs = useCallback(async () => {
    if (user?.uid === null) return

    const limitNumber = LIMIT + 1

    const relationship = await getRelationship()


    const next = query(
      getColRef('blogs'),
      ...(relationship.length > 0
        ? [where('relationship', 'array-contains-any', relationship)]
        : []),
      orderBy('createdAt', 'desc'),
      limit(limitNumber),
      startAfter(last)
    )

    onSnapshot(next, (querySnapshot) => {
      const docs = querySnapshot.docs.slice(0, LIMIT)
      const data = docs.map((docSnapshot) => {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }
      })
      setBlogs((prevState) => [...prevState, ...data])

      const lastVisible = docs[docs.length - 1]
      setLast(lastVisible)

      const size = querySnapshot.size
      setLoadedAll(size < limitNumber)
    })
  }, [getRelationship, last])

  const handleLoad = useCallback(() => {
    setLoading(true)
    fetchBlogs().finally(() => {
      setLoading(false)
    })
  }, [fetchBlogs])

  const handleLoadMore = useCallback(() => {
    setMoreLoading(true)
    fetchMoreBlogs().finally(() => {
      setMoreLoading(false)
    })
  }, [fetchMoreBlogs])

  useEffect(() => {
    handleLoad()
  }, [handleLoad])

  const handleCreatePost = useCallback(() => {
    navigate('/create-blog')
  }, [navigate])

  const handleLike = useCallback(async (doc) => {
    const likeData = {
      postId: doc.id,
      uid: doc.uid,
    }
    const likeDocRef = getDocRef('users', user.uid, 'likes', doc.id)
    await setDoc(likeDocRef, likeData)

    const blogDocRef = getDocRef('blogs', doc.id)
    const blogDocSnap = await getDoc(blogDocRef)
    const existed = blogDocSnap.exists()
    if (existed) {
      await updateDoc(blogDocRef, {
        relationship: arrayUnion(`${user.uid}_${doc.id}`),
      })
    }
  }, [])

  const handleUnLike = useCallback(async (doc) => {
    const likeDocRef = getDocRef('users', user.uid, 'likes', doc.id)
    const likeDocSnap = await getDoc(likeDocRef)
    if (likeDocSnap.exists()) {
      await deleteDocument('users', user.uid, 'likes', doc.id)
    }

    const blogDocRef = getDocRef('blogs', doc.id)
    const blogDocSnap = await getDoc(blogDocRef)
    const existed = blogDocSnap.exists()
    if (existed) {
      await updateDoc(blogDocRef, {
        relationship: arrayRemove(`${user.uid}_${doc.id}`),
      })
    }
  }, [])

  useEffect(() => {
    if (!user) return
    const likeDocRef = getColRef('users', user.uid, 'likes')
    const unsubscribe = onSnapshot(
      likeDocRef,
      async (querySnapshot) => {
        const data = querySnapshot.docs.map((docSnapshot) => {
          return {
            id: docSnapshot.id,
            ...docSnapshot.data(),
          }
        })
        setLikeList(data)
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
      Blog
      <br />
      <button onClick={handleCreatePost}>Create Post</button>
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
        {blogs.length > 0 && (
          <div>
            {blogs.map((doc) => {
              const isLiked = likeList.some((item) => item.postId === doc.id)
              return (
                <div
                  key={doc.id}
                  style={{
                    border: 'solid 1px black',
                    margin: 8,
                  }}
                >
                  <h3>{doc.title}</h3>
                  <p>{moment(doc.createdAt?.toDate()).fromNow()}</p>
                  <Link to={`/user/${doc.uid}`}>@{doc.uid}</Link>
                  <br />
                  {isLiked ? (
                    <button onClick={() => handleUnLike(doc)}>liked</button>
                  ) : (
                    <button onClick={() => handleLike(doc)}>like</button>
                  )}
                  <Link to={`/blog/${doc.id}`}>See more</Link>
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

export default Blog
