import { Button } from 'antd'
import {
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore'
import { Fragment, useCallback, useEffect, useState } from 'react'

import { getColRef } from '../../firebase/service'
import { CommentItem } from '../CommentItem'

const LIMIT = 10

export const CommentList = ({ currentBlog, parentId = '0', handleReply }) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [last, setLast] = useState(null)
  const [moreLoading, setMoreLoading] = useState(false)
  const [loadedAll, setLoadedAll] = useState(false)

  const fetchData = useCallback(async () => {
    // console.log('fetchData')
    if (!currentBlog) return

    setLoading(true)

    const limitNumber = LIMIT + 1

    const commentDocRef = getColRef('blogs', currentBlog.id, 'comments')
    const first = query(
      commentDocRef,
      where('parentId', '==', parentId),
      orderBy('createdAt', 'desc'),
      limit(limitNumber)
    )

    // onSnapshot
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

      querySnapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          // console.log("New city: ", change.doc.data());
        }
        if (change.type === 'modified') {
          // console.log("Modified city: ", change.doc.data());
        }
        if (change.type === 'removed') {
          // console.log("Removed city: ", change.doc.data());
        }
      })
    })

    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [currentBlog])

  const fetchMoreData = useCallback(async () => {
    // console.log('fetchMoreData')

    if (moreLoading || loadedAll) {
      return
    }

    setMoreLoading(true)

    const limitNumber = LIMIT + 1

    const commentDocRef = getColRef('blogs', currentBlog.id, 'comments')
    const next = query(
      commentDocRef,
      where('parentId', '==', parentId),
      orderBy('createdAt', 'desc'),
      limit(limitNumber),
      ...(last ? [startAfter(last)] : [])
    )

    // onSnapshot
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

    setTimeout(() => {
      setMoreLoading(false)
    }, 1000)
  }, [last, moreLoading, loadedAll])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const LoadMoreCommentList = useCallback(
    () =>
      !loadedAll && !moreLoading ? (
        <div
          style={{
            textAlign: 'center',
            marginTop: 12,
            height: 32,
            lineHeight: '32px',
          }}
        >
          <Button onClick={fetchMoreData}>Load more</Button>
        </div>
      ) : null,
    [loadedAll, moreLoading, fetchMoreData]
  )

  return (
    <Fragment>
      {data.length > 0 &&
        data.map((comment, ci) => {
          return (
            <CommentItem
              key={`comment-${ci}`}
              comment={comment}
              handleReply={handleReply}
            >
              <CommentList
                currentBlog={currentBlog}
                parentId={comment.id}
              />
            </CommentItem>
          )
        })}
      <LoadMoreCommentList />
    </Fragment>
  )
}
