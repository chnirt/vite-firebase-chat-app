import React, { useCallback, useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Avatar, Divider, List, Skeleton, Space } from 'antd'
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
import { LikeOutlined, MessageOutlined, StarOutlined } from '@ant-design/icons'

import { getColRef } from '../../firebase/service'
import { useAuth } from '../../context'

const LIMIT = 5

export const BlogList = () => {
  const { user } = useAuth()
  const [relationshipList, setRelationshipList] = useState([])
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [last, setLast] = useState(null)
  const [moreLoading, setMoreLoading] = useState(false)
  const [loadedAll, setLoadedAll] = useState(false)

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
    if (loading || loadedAll) {
      return
    }
    if (last) {
      setMoreLoading(true)
    } else {
      setLoading(true)
    }

    const limitNumber = LIMIT + 1

    const relationship = await getRelationship()
    const relationshipIds = relationship.map((item) => item.uid)

    // Query the first page of docs
    // Query the first page of docs
    const first = query(
      getColRef('blogs'),
      ...(relationship.length > 0 ? [where('uid', 'in', relationshipIds)] : []),
      orderBy('createdAt', 'desc'),
      limit(limitNumber),
      ...(last ? [startAfter(last)] : [])
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
      if (last) {
        setData((prevState) => [...prevState, ...data])
      } else {
        setData(data)
      }

      const lastVisible = docs[docs.length - 1]
      setLast(lastVisible)

      const size = querySnapshot.size
      setLoadedAll(size < limitNumber)
    })

    if (last) {
      setMoreLoading(false)
    } else {
      setLoading(false)
    }
  }, [getRelationship, loading, last, loadedAll])

  useEffect(() => {
    fetchData()
  }, [])

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
        height: 400,
        overflow: 'auto',
        padding: '0 16px',
        border: '1px solid rgba(140, 140, 140, 0.35)',
      }}
    >
      <InfiniteScroll
        dataLength={data.length}
        // next={loadMoreData}
        // hasMore={data.length < 50}
        next={fetchData}
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
            const title = item.title
            const createdAt = moment(item.createdAt?.toDate()).fromNow()
            // const isLiked = likeList.some((item) => item.postId === doc.id)
            const foundRelationship = findRelationship(item.uid)
            const username = foundRelationship?.username
            const avatar = foundRelationship?.avatar
            return (
              <List.Item
                key={id}
                actions={[
                  <IconText
                    icon={StarOutlined}
                    text="156"
                    key="list-vertical-star-o"
                  />,
                  <IconText
                    icon={LikeOutlined}
                    text="156"
                    key="list-vertical-like-o"
                  />,
                  <IconText
                    icon={MessageOutlined}
                    text="2"
                    key="list-vertical-message"
                  />,
                ]}
                extra={
                  <img
                    width={272}
                    alt="logo"
                    src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
                  />
                }
              >
                <List.Item.Meta
                  avatar={<Avatar src={avatar} />}
                  title={<Link to={`/user/${username}`}>@{username}</Link>}
                  description={createdAt}
                />
                <div>{title}</div>
              </List.Item>
            )
          }}
        />
      </InfiniteScroll>
    </div>
  )
}
