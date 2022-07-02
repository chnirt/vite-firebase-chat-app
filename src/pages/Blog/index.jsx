import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
// import {
//   collection,
//   query,
//   orderBy,
//   limit,
//   // getDocs,
//   startAfter,
//   onSnapshot,
//   // where,
// } from 'firebase/firestore'
import moment from 'moment'

// import { db } from '../../firebase'
// import { useAuth } from '../../context'
import { useFetch } from '../../firebase/hooks'

// const LIMIT = 3

const Blog = () => {
  let navigate = useNavigate()
  // const { user } = useAuth()
  const {
    loading,
    data: blogs,
    moreLoading,
    loadedAll,
    handleLoadMore
  } = useFetch('blogs', 3)
  // const [loading, setLoading] = useState(false)
  // const [blogs, setBlogs] = useState([])
  // const [last, setLast] = useState(null)
  // const [moreLoading, setMoreLoading] = useState(false)
  // const [loadedAll, setLoadedAll] = useState(false)

  // const fetchBlogs = useCallback(async () => {
  //   if (user?.uid === null) return

  //   const currentLimit = LIMIT + 1

  //   // Query the first page of docs
  //   const first = query(
  //     collection(db, 'blogs'),
  //     orderBy('createdAt', 'desc'),
  //     limit(currentLimit)
  //   )

  //   // const documentSnapshots = await getDocs(first)
  //   // const docs = documentSnapshots.docs
  //   // setBlogs(docs.map((doc) => ({ id: doc.id, ...doc.data() })))

  //   // // Get the last visible document
  //   // const lastVisible =
  //   //   docs[docs.length - 1]
  //   // setLast(lastVisible)
  //   // if (docs.length < LIMIT) {
  //   //   setLoadedAll(true)
  //   // }

  //   onSnapshot(first, (querySnapshot) => {
  //     const docs = querySnapshot.docs.slice(0, LIMIT)
  //     const data = docs.map((docSnapshot) => {
  //       return {
  //         id: docSnapshot.id,
  //         ...docSnapshot.data(),
  //       }
  //     })
  //     setBlogs(data)

  //     const lastVisible = docs[docs.length - 1]
  //     setLast(lastVisible)

  //     const size = querySnapshot.size
  //     setLoadedAll(size < currentLimit)
  //   })
  // }, [])


  // const fetchMoreBlogs = useCallback(async () => {
  //   if (user?.uid === null) return

  //   const currentLimit = LIMIT + 1

  //   const next = query(
  //     collection(db, 'blogs'),
  //     orderBy('createdAt', 'desc'),
  //     limit(currentLimit),
  //     startAfter(last)
  //   )

  //   // const documentSnapshots = await getDocs(next)
  //   // const nextDocs = documentSnapshots.docs
  //   // const nextBlogs = nextDocs.map((doc) => ({ id: doc.id, ...doc.data() }))
  //   // setBlogs((prevState) => [...prevState, ...nextBlogs])

  //   // // Get the last visible document
  //   // const lastVisible = nextDocs[nextDocs.length - 1]
  //   // setLast(lastVisible)
  //   // if (nextDocs.length < LIMIT) {
  //   //   setLoadedAll(true)
  //   // }

  //   onSnapshot(next, (querySnapshot) => {
  //     const docs = querySnapshot.docs.slice(0, LIMIT)
  //     const data = docs.map((docSnapshot) => {
  //       return {
  //         id: docSnapshot.id,
  //         ...docSnapshot.data(),
  //       }
  //     })
  //     setBlogs((prevState) => [...prevState, ...data])

  //     const lastVisible = docs[docs.length - 1]
  //     setLast(lastVisible)

  //     const size = querySnapshot.size
  //     setLoadedAll(size < currentLimit)
  //   })
  // }, [last])

  // const handleLoadMore = useCallback(() => {
  //   setMoreLoading(true)
  //   fetchMoreBlogs().finally(() => {
  //     setMoreLoading(false)
  //   })
  // }, [fetchMoreBlogs])

  const handleCreatePost = useCallback(() => {
    navigate('/create-blog')
  }, [navigate])

  // useEffect(() => {
  //   setLoading(true)
  //   fetchBlogs().finally(() => {
  //     setLoading(false)
  //   })
  // }, [fetchBlogs])

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
            {blogs.map((doc) => (
              <div
                key={doc.id}
                style={{
                  border: 'solid 1px black',
                  margin: 8,
                }}
              >
                <h3>{doc.title}</h3>
                <p>{moment(doc.createdAt?.toDate()).fromNow()}</p>
                <Link to={`/user/${doc.uid}`}>@{doc.uid}</Link><br />
                <Link to={`/blog/${doc.id}`}>See more</Link>
              </div>
            ))}
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
