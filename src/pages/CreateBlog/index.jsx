import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'
import { arrayUnion, serverTimestamp } from 'firebase/firestore'

import { BackButton } from '../../components'
import { useAuth } from '../../context'
import { eventNames } from '../../constants'
import { addDocument, getColRef } from '../../firebase/service'
import { logAnalyticsEvent } from '../../firebase/analytics'

const CreateBlog = () => {
  let navigate = useNavigate()
  const { user } = useAuth()
  const [title, setTitle] = useState('title')
  const [value, setValue] = useState('**Hello world!!!**')

  const handlePublish = useCallback(async () => {
    if (user?.uid === null) return
    if (title === '') return
    if (value === '') return

    const blogData = {
      title,
      content: value,
      uid: user.uid,
      relationship: arrayUnion(user.uid),
      createdAt: serverTimestamp()
    }
    const blogDocRef = getColRef('blogs')
    const createdBlogDocRef = await addDocument(blogDocRef, blogData)

    logAnalyticsEvent(eventNames.createBlog, {
      title,
      content: value,
    })

    createdBlogDocRef && navigate(-1)
  }, [title, value, user, logAnalyticsEvent])

  return (
    <div>
      Create Blog
      <br />
      <BackButton />
      <br />
      <input
        type="text"
        placeholder="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <br />
      <div className="container">
        <div data-color-mode="light">
          <div className="wmde-markdown-var"></div>
          <MDEditor value={value} onChange={setValue} />
        </div>
        <button onClick={handlePublish}>Publish</button>
      </div>
    </div>
  )
}

export default CreateBlog
