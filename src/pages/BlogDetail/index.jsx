import { useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDocument } from 'react-firebase-hooks/firestore'
import { doc } from 'firebase/firestore'
import moment from 'moment'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import { db } from '../../firebase'
import { BackButton } from '../../components'
import { deleteDocument } from '../../firebase/service'
import { eventNames } from '../../constants'
import { logEventAnalytics } from '../../firebase/analytics'

const BlogDetail = () => {
  let { blogId } = useParams()
  let navigate = useNavigate()
  const [value, loading, error] = useDocument(doc(db, 'blogs', blogId), {
    snapshotListenOptions: { includeMetadataChanges: true },
  })

  const handleDelete = useCallback(
    async (id) => {
      await deleteDocument('blogs', id)

      logEventAnalytics(eventNames.deleteBlog, {
        blogId: id,
      })

      navigate(-1)
    },
    [deleteDocument, logEventAnalytics]
  )

  return (
    <div>
      BlogDetail
      <br />
      <BackButton />
      <div>
        {error && <strong>Error: {JSON.stringify(error)}</strong>}
        {loading && <span>Document: Loading...</span>}
        {value && (
          <div>
            <h3>{value.data()?.title}</h3>
            <ReactMarkdown
              children={value.data()?.content}
              remarkPlugins={[remarkGfm]}
            />
            <p>{moment(value.data()?.createdAt?.toDate()).fromNow()}</p>
          </div>
        )}
      </div>
      <button onClick={() => handleDelete(value.id)}>Delete</button>
    </div>
  )
}

export default BlogDetail
