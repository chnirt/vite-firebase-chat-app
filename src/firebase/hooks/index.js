import { useCallback, useEffect, useState } from 'react'
import {
  query,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  where,
} from 'firebase/firestore'

import { getColGroupRef, getColRef } from '../service'

export const useFetch = (collectionName = 'todos', option) => {
  const formatOption = {
    // type: 'collection',
    // limit: 10,
    // orderBy: ['createdAt', 'asc'],
    // where: ['members', 'array-contains', user.uid],
    ...option,
  }
  const TYPE = formatOption.type
  const LIMIT = formatOption.limit
  const ORDERBY = formatOption.orderBy
  const WHERE = formatOption.where
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [last, setLast] = useState(null)
  const [moreLoading, setMoreLoading] = useState(false)
  const [loadedAll, setLoadedAll] = useState(false)

  const fetchData = useCallback(async (keyword) => {
    const limitNumber = LIMIT + 1

    // Query the first page of docs
    const first = query(
      ...(TYPE === 'collectionGroup' ? [getColGroupRef(collectionName)] : [getColRef(collectionName)]),
      ...(keyword ? [where('keywords', 'array-contains', keyword)] : []),
      ...(WHERE ? [where(WHERE[0], WHERE[1], WHERE[2])] : []),
      ...(ORDERBY ? [orderBy(ORDERBY[0], ORDERBY[1])] : [orderBy('createdAt', 'desc')]),
      limit(limitNumber)
    )

    onSnapshot(first, (querySnapshot) => {
      // querySnapshot.docs.map(a => a.ref)
      const docs = querySnapshot.docs.slice(0, LIMIT)
      const data = docs.map((docSnapshot) => {
        // console.log(docSnapshot)
        return {
          // ...docSnapshot,
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

  const fetchMoreData = useCallback(async () => {
    const limitNumber = LIMIT + 1

    const next = query(
      getColRef(collectionName),
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

  const handleLoad = useCallback(() => {
    setLoading(true)
    fetchData().finally(() => {
      setLoading(false)
    })
  }, [fetchData])

  const handleLoadMore = useCallback(() => {
    setMoreLoading(true)
    fetchMoreData().finally(() => {
      setMoreLoading(false)
    })
  }, [fetchMoreData])

  useEffect(() => {
    handleLoad()
  }, [handleLoad])

  return {
    loading,
    data,
    fetchData,
    moreLoading,
    loadedAll,
    handleLoadMore,
  }
}
