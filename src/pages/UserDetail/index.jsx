import moment from 'moment'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getDocs, query, where } from 'firebase/firestore'

import { getColRef } from '../../firebase/service'
import { BackButton } from '../../components'

const UserDetail = () => {
  let { userId } = useParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchData = async (userId) => {
      try {
        setLoading(true)

        const q = query(getColRef('users'), where("uid", "==", userId))
        const querySnapshot = await getDocs(q)
        const docs = querySnapshot.docs
        const data = docs.map((docSnapshot) => {
          return {
            id: docSnapshot.id,
            ...docSnapshot.data(),
          }
        })
        const foundUser = data[0]

        // console.log(foundUser)
        setUser(foundUser)
      } catch (error) {
        // console.log(error.message)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData(userId)
  }, [userId])

  if (!user) return null

  return (
    <div>
      UserDetail
      <br />
      <BackButton />
      <div>
        {error && <strong>Error: {JSON.stringify(error)}</strong>}
        {loading && <span>Document: Loading...</span>}
        {user && (
          <div>
            <h3>{user?.email}</h3>
            <p>{moment(user?.createdAt?.toDate()).fromNow()}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserDetail
