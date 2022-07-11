import { Fragment, useCallback } from 'react'
import { Button, Row, Typography } from 'antd'
import { FiEdit } from 'react-icons/fi'

import { useAuth } from '../../context'
import { useFetch } from '../../firebase/hooks'
import { ChatItem } from '../ChatItem'
import { LoadingChatList } from '../LoadingChatList'

export const ChatList = ({ handleJoinChat = () => { } }) => {
  const { user } = useAuth()
  const {
    loading,
    data: chats,
    moreLoading,
    loadedAll,
    handleLoadMore,
  } = useFetch('chats', {
    limit: 10,
    where: ['members', 'array-contains', user.uid],
  })

  const handleCreateChat = useCallback(() => { }, [])

  const ChatListHeader = useCallback(
    () => (
      <Row
        style={{
          height: 59,
          padding: '0 20px',
          borderBottom: '1px solid #F0F0F0',
        }}
        align="middle"
        justify="space-between"
      >
        <Typography.Title
          style={{
            marginLeft: '14px',
            marginBottom: 0,
          }}
          level={5}
        >
          {user?.username}
        </Typography.Title>
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
          icon={<FiEdit size={20} color="#767676" />}
          onClick={handleCreateChat}
        />
      </Row>
    ),
    [user]
  )

  const LoadMoreChatList = useCallback(
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
          <Button onClick={handleLoadMore}>Load more</Button>
        </div>
      ) : null,
    [loadedAll, moreLoading, handleLoadMore]
  )

  const ChatListBody = useCallback(
    () => (
      <div>
        <Row
          style={{
            height: 'calc(100% - 63px)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              paddingTop: 8,
              overflow: 'hidden auto',
              height: '100%',
              width: '100%',
            }}
          >
            {chats.length > 0 ? (
              <div>
                {chats.map((chat, ci) => {
                  return (
                    <ChatItem
                      key={`chat-${ci}`}
                      chat={chat}
                      handleJoinChat={handleJoinChat}
                    />
                  )
                })}
                <LoadMoreChatList />
              </div>
            ) : (
              <LoadingChatList />
            )}
          </div>
        </Row>
      </div>
    ),
    [chats]
  )

  return (
    <Fragment>
      <ChatListHeader />
      <ChatListBody />
    </Fragment>
  )

  // return (
  //   <div
  //     style={{
  //       height: 500,
  //       flex: 1,
  //       border: 'solid 1px black',
  //       overflowY: 'scroll',
  //       paddingTop: 8,
  //       paddingBottom: 8,
  //     }}
  //   >
  //     ChatList
  //     {loading && <span>Collection: Loading...</span>}
  //     {chats.length > 0 && (
  //       <div>
  //         {chats.map((doc, di) => {
  //           return (
  //             <ChatItem
  //               key={`chat-${di}`}
  //               chat={doc}
  //               handleJoinChat={handleJoinChat}
  //             />
  //           )
  //         })}
  //       </div>
  //     )}
  //     {!loadedAll ? (
  //       moreLoading ? (
  //         <span>Collection: Loading...</span>
  //       ) : (
  //         <button onClick={handleLoadMore}>Load more</button>
  //       )
  //     ) : null}
  //   </div>
  // )
}
