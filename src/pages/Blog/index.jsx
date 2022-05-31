import { useCallback, useEffect, useState } from 'react'
import {
  collection,
  query,
  orderBy,
  limit,
  // getDocs,
  startAfter,
  onSnapshot,
} from 'firebase/firestore'
import moment from 'moment'
import 'easymde/dist/easymde.min.css'

import { db } from '../../firebase'
import { Link } from 'react-router-dom'

const LIMIT = 3

const Blog = () => {
  const [loading, setLoading] = useState(false)
  const [blogs, setBlogs] = useState([])
  const [last, setLast] = useState(null)
  const [moreLoading, setMoreLoading] = useState(false)
  const [loadedAll, setLoadedAll] = useState(false)

  const fetchBlogs = useCallback(async () => {
    // Query the first page of docs
    const first = query(
      collection(db, 'blogs'),
      orderBy('createdAt', 'desc'),
      limit(LIMIT)
    )

    // const documentSnapshots = await getDocs(first)
    // const docs = documentSnapshots.docs
    // setBlogs(docs.map((doc) => ({ id: doc.id, ...doc.data() })))

    // // Get the last visible document
    // const lastVisible =
    //   docs[docs.length - 1]
    // setLast(lastVisible)
    // if (docs.length < LIMIT) {
    //   setLoadedAll(true)
    // }

    onSnapshot(first, (querySnapshot) => {
      const docs = querySnapshot.docs
      const data = docs.map((docSnapshot) => {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }
      })
      setBlogs(data)

      const lastVisible = docs[docs.length - 1]
      setLast(lastVisible)
      if (docs.length < LIMIT) {
        setLoadedAll(true)
      }
    })
  }, [])

  const fetchMoreBlogs = useCallback(async () => {
    const next = query(
      collection(db, 'blogs'),
      orderBy('createdAt', 'desc'),
      limit(LIMIT),
      startAfter(last)
    )

    // const documentSnapshots = await getDocs(next)
    // const nextDocs = documentSnapshots.docs
    // const nextBlogs = nextDocs.map((doc) => ({ id: doc.id, ...doc.data() }))
    // setBlogs((prevState) => [...prevState, ...nextBlogs])

    // // Get the last visible document
    // const lastVisible = nextDocs[nextDocs.length - 1]
    // setLast(lastVisible)
    // if (nextDocs.length < LIMIT) {
    //   setLoadedAll(true)
    // }

    onSnapshot(next, (querySnapshot) => {
      const docs = querySnapshot.docs
      const data = docs.map((docSnapshot) => {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }
      })
      setBlogs((prevState) => [...prevState, ...data])

      const lastVisible = docs[docs.length - 1]
      setLast(lastVisible)
      if (docs.length < LIMIT) {
        setLoadedAll(true)
      }
    })
  }, [last])

  const handleLoadMore = useCallback(() => {
    setMoreLoading(true)
    fetchMoreBlogs().finally(() => {
      setMoreLoading(false)
    })
  }, [fetchMoreBlogs])

  useEffect(() => {
    setLoading(true)
    fetchBlogs().finally(() => {
      setLoading(false)
    })
  }, [fetchBlogs])

  return (
    <div>
      Blog
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
        {blogs.length && (
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
