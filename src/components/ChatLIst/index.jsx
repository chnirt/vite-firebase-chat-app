import moment from 'moment'
import React, { useCallback } from 'react'
import { Link } from 'react-router-dom'

import { useFetch } from '../../firebase/hooks'

const ChatList = () => {
  const {
    loading,
    data: chats,
    moreLoading,
    loadedAll,
    handleLoadMore,
  } = useFetch('chats', 3)

  const handleJoinChat = useCallback((doc) => { }, [])

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
          {chats.map((doc) => (
            <div
              key={doc.id}
              style={{
                border: 'solid 1px black',
                margin: 8,
                display: 'flex',
                flexDirection: 'row',
                // justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Link to={`/user/${doc.uid}`}>@{doc.uid}</Link>
              {/* <img src={doc.downloadURL} width={200} height={200} /> */}
              <p>{moment(doc.createdAt?.toDate()).fromNow()}</p>
              <button onClick={() => handleJoinChat(doc)}>Join</button>
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
  )
}

export default ChatList
