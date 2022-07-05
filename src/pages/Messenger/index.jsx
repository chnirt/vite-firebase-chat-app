import { getDocs, orderBy, query } from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'

import { ChatList, MessageList } from '../../components'
import { useAuth } from '../../context'
import { getColRef } from '../../firebase/service'

const Messenger = () => {
  const { user } = useAuth()
  const [currentChat, setCurrentChat] = useState(null)
  const [relationshipList, setRelationshipList] = useState([])

  // console.log(relationshipList)

  const joinChat = useCallback((doc) => setCurrentChat(doc), [])

  const leaveChat = useCallback(() => setCurrentChat(null), [])

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

  useEffect(() => {
    getRelationship()
  }, [getRelationship])

  return (
    <div>
      <div>Messenger</div>
      <div
        style={{
          height: 500,
          display: 'flex',
          flexDirection: 'row',
          border: 'solid 1px black',
          overflow: 'hidden',
        }}
      >
        <ChatList
          handleJoinChat={joinChat}
          findRelationship={findRelationship}
        />
        <MessageList
          currentChat={currentChat}
          findRelationship={findRelationship}
        />
      </div>
    </div>
  )
}

export default Messenger
