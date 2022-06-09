import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MDEditor from '@uiw/react-md-editor'
import { logEvent } from 'firebase/analytics'

import { BackButton } from '../../components'
import { useAuth } from '../../context'
import { addDocument } from '../../firebase/service'
import { analytics } from '../../firebase'
import { eventNames } from '../../constants'

const CreateBlog = () => {
  let navigate = useNavigate()
  const { user } = useAuth()
  const [title, setTitle] = useState('title')
  const [value, setValue] = useState('**Hello world!!!**')

  const handlePublish = useCallback(async () => {
    if (user?.uid === null) return
    if (title === '') return
    if (value === '') return

    const options = {
      generated: true
    }
    const docRef = await addDocument('blogs', {
      title,
      content: value,
      uid: user.uid,
    }, options)

    logEvent(analytics, eventNames.createBlog, {
      title,
      content: value,
    })

    docRef && navigate(-1)
  }, [title, value, user])

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
