import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'

import { useAuth } from '../../context'
import { db } from '../../firebase'

const LIMIT = 3

export const UserList = ({ handleCall = () => { } }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [last, setLast] = useState(null)
  // const [moreLoading, setMoreLoading] = useState(false)
  const [loadedAll, setLoadedAll] = useState(false)

  const fetchUsers = useCallback(async () => {
    if (user?.uid === null) return

    // Query the first page of docs
    const first = query(
      collection(db, 'users'),
      where('uid', '!=', user.uid),
      orderBy('uid'),
      orderBy('createdAt', 'desc'),
      limit(LIMIT)
    )

    onSnapshot(first, (querySnapshot) => {
      const docs = querySnapshot.docs
      const data = docs.map((docSnapshot) => {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }
      })
      setUsers(data)

      const lastVisible = docs[docs.length - 1]
      setLast(lastVisible)
      setLoadedAll(docs.length < LIMIT)
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchUsers().finally(() => setLoading(false))
  }, [])

  return (
    <div>
      User List
      <br />
      {loading && <span>Collection: Loading...</span>}
      {users.length > 0 && (
        <div>
          {users.map((user, ui) => (
            <div key={`user-${ui}`}>
              {user.email}
              <button onClick={() => handleCall(user)}>Call</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
