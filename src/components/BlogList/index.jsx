import { useCallback, useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Avatar, Button, Divider, List, Skeleton, Space } from 'antd'
import {
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore'
import { Link } from 'react-router-dom'
import moment from 'moment'
import { FiHeart } from 'react-icons/fi'
import { IoChatbubbleOutline, IoPaperPlaneOutline } from 'react-icons/io5'

import {
  addDocument,
  deleteDocument,
  getColRef,
  getDocRef,
  getDocument,
} from '../../firebase/service'
import { useAuth, useLoading } from '../../context'
import { avatarPlaceholder } from '../../constants'

const LIMIT = 10

export const BlogList = () => {
  const { user } = useAuth()
  const appLoading = useLoading()
  const [relationshipList, setRelationshipList] = useState([])
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [last, setLast] = useState(null)
  const [moreLoading, setMoreLoading] = useState(false)
  const [loadedAll, setLoadedAll] = useState(false)
  const [likeList, setLikeList] = useState([])

  const handleLike = useCallback(async (doc) => {
    const likeData = {
      postId: doc.id,
      uid: doc.uid,
    }
    const likeDocRef = getDocRef('users', user.uid, 'likes', doc.id)
    await addDocument(likeDocRef, likeData)
  }, [])

  const handleUnlike = useCallback(async (doc) => {
    const likeDocRef = getDocRef('users', user.uid, 'likes', doc.id)
    const likeDocData = await getDocument(likeDocRef)

    if (likeDocData) {
      await deleteDocument('users', user.uid, 'likes', doc.id)
    }
  }, [])

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

  const fetchData = useCallback(async () => {
    // console.log('fetchData')

    if (loading) {
      return
    }

    appLoading.show()
    setLoading(true)

    const limitNumber = LIMIT + 1

    const relationship = await getRelationship()
    const relationshipIds = relationship.map((item) => item.uid)

    // Query the first page of docs
    const first = query(
      getColRef('blogs'),
      ...(relationship.length > 0 ? [where('uid', 'in', relationshipIds)] : []),
      orderBy('createdAt', 'desc'),
      limit(limitNumber)
    )

    // getDocs
    // const querySnapshot = await getDocs(first)
    // const docs = querySnapshot.docs.slice(0, LIMIT)
    // const data = docs.map((docSnapshot) => {
    //   return {
    //     id: docSnapshot.id,
    //     ...docSnapshot.data(),
    //   }
    // })
    // setData(data)
    // const lastVisible = docs[docs.length - 1]
    // setLast(lastVisible)
    // const size = querySnapshot.size
    // setLoadedAll(size < limitNumber)

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
    })

    setLoading(false)
    setTimeout(() => {
      appLoading.hide()
    }, 1000)
  }, [getRelationship, loading])

  const fetchMoreData = useCallback(async () => {
    // console.log('fetchMoreData')

    if (moreLoading || loadedAll) {
      return
    }

    setMoreLoading(true)

    const limitNumber = LIMIT + 1

    const relationship = await getRelationship()
    const relationshipIds = relationship.map((item) => item.uid)

    // Query the next page of docs
    const next = query(
      getColRef('blogs'),
      ...(relationship.length > 0 ? [where('uid', 'in', relationshipIds)] : []),
      orderBy('createdAt', 'desc'),
      limit(limitNumber),
      ...(last ? [startAfter(last)] : [])
    )

    // getDocs
    // const querySnapshot = await getDocs(next)
    // const docs = querySnapshot.docs.slice(0, LIMIT)
    // const data = docs.map((docSnapshot) => {
    //   return {
    //     id: docSnapshot.id,
    //     ...docSnapshot.data(),
    //   }
    // })
    // setData((prevState) => [...prevState, ...data])
    // const lastVisible = docs[docs.length - 1]
    // setLast(lastVisible)
    // const size = querySnapshot.size
    // setLoadedAll(size < limitNumber)

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

    setMoreLoading(false)
  }, [getRelationship, last, moreLoading])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!user) return
    const likeDocRef = getColRef('users', user.uid, 'likes')
    const unsubscribeLike = onSnapshot(
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
      unsubscribeLike()
    }
  }, [user])

  const IconText = ({ icon, text }) => (
    <Space>
      {React.createElement(icon)}
      {text}
    </Space>
  )

  return (
    <div
      id="scrollableDiv"
      style={{
        height: 'calc(var(--app-height) - 90px)',
        overflow: 'auto',
        padding: '0 16px',
        border: '1px solid rgba(140, 140, 140, 0.35)',
        borderRadius: 3,
      }}
    >
      <InfiniteScroll
        dataLength={data.length}
        // next={loadMoreData}
        // hasMore={data.length < 50}
        next={fetchMoreData}
        hasMore={!loadedAll}
        loader={
          <Skeleton
            avatar
            paragraph={{
              rows: 1,
            }}
            active
          />
        }
        endMessage={<Divider plain>It is all, nothing more 🤐</Divider>}
        scrollableTarget="scrollableDiv"
      >
        <List
          itemLayout="vertical"
          size="large"
          // pagination={{
          //   onChange: page => {
          //     console.log(page);
          //   },
          //   pageSize: 3,
          // }}
          dataSource={data}
          // footer={
          //   <div>
          //     <b>ant design</b> footer part
          //   </div>
          // }
          renderItem={(item) => {
            const id = item.id
            const caption = item.caption
            const file = item.files[0].file
            const createdAt = moment(item.createdAt?.toDate()).fromNow()
            const isLiked = likeList.some((like) => like.postId === item.id)
            const foundRelationship = findRelationship(item.uid)
            const username = foundRelationship?.username
            const avatar = foundRelationship?.avatar
            return (
              <List.Item
                key={`item-${id}`}
                actions={[
                  <Button
                    style={{
                      border: 0,
                      boxShadow: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    ghost
                    shape="circle"
                    icon={
                      isLiked ? (
                        <FiHeart size={18} color="#ff4d4f" fill="#ff4d4f" />
                      ) : (
                        <FiHeart size={18} color="#767676" />
                      )
                    }
                    onClick={() =>
                      isLiked ? handleUnlike(item) : handleLike(item)
                    }
                  />,
                  <Button
                    style={{
                      border: 0,
                      boxShadow: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    ghost
                    shape="circle"
                    icon={<IoChatbubbleOutline size={18} color="#767676" />}
                  />,
                  <Button
                    style={{
                      border: 0,
                      boxShadow: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    ghost
                    shape="circle"
                    icon={<IoPaperPlaneOutline size={18} color="#767676" />}
                  />,
                ]}
                extra={
                  <img
                    width={272}
                    alt="logo"
                    src={file}
                  />
                }
              >
                <List.Item.Meta
                  avatar={<Avatar src={avatar ?? avatarPlaceholder} />}
                  title={<Link to={`/user/${username}`}>@{username}</Link>}
                  description={createdAt}
                />
                <div>{caption}</div>
              </List.Item>
            )
          }}
        />
      </InfiniteScroll>
    </div>
  )
}
