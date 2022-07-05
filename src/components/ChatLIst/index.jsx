import React from 'react'
import { useAuth } from '../../context'

import { useFetch } from '../../firebase/hooks'
import { ChatItem } from '../ChatItem'

export const ChatList = ({ handleJoinChat = () => { } }) => {
  const { user } = useAuth()
  const {
    loading,
    data: chats,
    moreLoading,
    loadedAll,
    handleLoadMore,
  } = useFetch('chats', {
    limit: 3,
    where: ['members', 'array-contains', user.uid],
  })

  return (
    <div
      style={{
        height: 500,
        flex: 1,
        border: 'solid 1px black',
        overflowY: 'scroll',
        paddingTop: 8,
        paddingBottom: 8,
      }}
    >
      ChatList
      {loading && <span>Collection: Loading...</span>}
      {chats.length > 0 && (
        <div>
          {chats.map((doc, di) => {
            return (
              <ChatItem
                key={`chat-${di}`}
                chat={doc}
                handleJoinChat={handleJoinChat}
              />
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
  )
}
