import { useCallback, useEffect, useState } from 'react'
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
} from 'firebase/firestore'

import { db } from '../../firebase'

export const useFetch = (collectionName = 'todos', LIMIT = 10) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [last, setLast] = useState(null)
  const [moreLoading, setMoreLoading] = useState(false)
  const [loadedAll, setLoadedAll] = useState(false)

  const fetchBlogs = useCallback(async () => {
    const limitNumber = LIMIT + 1

    // Query the first page of docs
    const first = query(
      collection(db, collectionName),
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
      setData(data)

      const lastVisible = docs[docs.length - 1]
      setLast(lastVisible)

      const size = querySnapshot.size
      setLoadedAll(size < limitNumber)
    })
  }, [])


  const fetchMoreBlogs = useCallback(async () => {
    const limitNumber = LIMIT + 1

    const next = query(
      collection(db, collectionName),
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
      setData((prevState) => [...prevState, ...data])

      const lastVisible = docs[docs.length - 1]
      setLast(lastVisible)

      const size = querySnapshot.size
      setLoadedAll(size < limitNumber)
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

  return {
    loading,
    data,
    moreLoading,
    loadedAll,
    handleLoadMore
  }
}