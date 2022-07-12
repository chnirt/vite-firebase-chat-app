import { Fragment } from 'react'

import { ChatListHeader, ChatListBody } from '..'

export const ChatList = ({ handleJoinChat = () => { } }) => {
  // const { user } = useAuth()
  // const {
  //   loading,
  //   data: chats,
  //   moreLoading,
  //   loadedAll,
  //   handleLoadMore,
  // } = useFetch('chats', {
  //   limit: 10,
  //   where: ['members', 'array-contains', user.uid],
  // })

  // const LoadMoreChatList = useCallback(
  //   () =>
  //     !loadedAll && !moreLoading ? (
  //       <div
  //         style={{
  //           textAlign: 'center',
  //           marginTop: 12,
  //           height: 32,
  //           lineHeight: '32px',
  //         }}
  //       >
  //         <Button onClick={handleLoadMore}>Load more</Button>
  //       </div>
  //     ) : null,
  //   [loadedAll, moreLoading, handleLoadMore]
  // )

  // const ChatListBody = useCallback(
  //   () => (
  //     <div>
  //       <Row
  //         style={{
  //           height: 'calc(100% - 63px)',
  //           overflow: 'hidden',
  //         }}
  //       >
  //         <div
  //           style={{
  //             paddingTop: 8,
  //             overflow: 'hidden auto',
  //             height: '100%',
  //             width: '100%',
  //           }}
  //         >
  //           {chats.length > 0 ? (
  //             <div>
  //               {chats.map((chat, ci) => {
  //                 return (
  //                   <ChatItem
  //                     key={`chat-${ci}`}
  //                     chat={chat}
  //                     handleJoinChat={handleJoinChat}
  //                   />
  //                 )
  //               })}
  //               <LoadMoreChatList />
  //             </div>
  //           ) : (
  //             <LoadingChatList />
  //           )}
  //         </div>
  //       </Row>
  //     </div>
  //   ),
  //   [chats]
  // )

  return (
    <Fragment>
      <ChatListHeader />
      <ChatListBody handleJoinChat={handleJoinChat} />
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
