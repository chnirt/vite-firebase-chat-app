import { useState, useCallback } from 'react'
import moment from 'moment'
import { Link } from 'react-router-dom'

import {
  deleteStorageFile,
  uploadStorageBytesResumable,
} from '../../firebase/storage'
import { useAuth } from '../../context'
import {
  addDocument,
  deleteDocument,
  getColRef,
} from '../../firebase/service'
import { logAnalyticsEvent } from '../../firebase/analytics'
import { eventNames } from '../../constants'
import { useFetch } from '../../firebase/hooks'

const Pexels = () => {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [state, setState] = useState(null)
  const [progress, setProgress] = useState(0)
  const [downloadURL, setDownloadURL] = useState(null)

  const {
    loading,
    data: photos,
    moreLoading,
    loadedAll,
    handleLoadMore,
  } = useFetch('photos', 3)

  const onProgress = useCallback(
    ({ state, progress }) => {
      setState(state)
      setProgress(progress)
    },
    [setState, setProgress]
  )

  const onComplete = useCallback(
    async ({ downloadURL, url }) => {
      setDownloadURL(downloadURL)

      const photoColRef = getColRef('photos')
      const photoData = {
        downloadURL,
        url,
        uid: user.uid,
      }
      await addDocument(photoColRef, photoData)

      logAnalyticsEvent(eventNames.addPhoto, {
        url,
      })
    },
    [setDownloadURL, addDocument, logAnalyticsEvent]
  )

  // Creates a Firebase Upload Task
  const handleUploadFile = useCallback(
    (e) => {
      try {
        const uploadTask = uploadStorageBytesResumable(
          e,
          onProgress,
          null,
          onComplete
        )

        // // Pause the upload
        // uploadTask.pause();

        // // Resume the upload
        // uploadTask.resume();

        // // Cancel the upload
        // uploadTask.cancel();
      } catch (error) {
      } finally {
        setUploading(false)
      }
    },
    [uploadStorageBytesResumable, onProgress, onComplete, setUploading]
  )

  const handleDelete = useCallback(async (doc) => {
    await deleteDocument('photos', doc.id)
    await deleteStorageFile(doc.url)
  }, [])

  const Upload = () => {
    return (
      <div>
        {uploading && (
          <h3>
            {state} - {progress}%
          </h3>
        )}
        {!uploading && (
          <>
            <label className="btn">
              📸 Upload Img
              <input
                type="file"
                onChange={handleUploadFile}
                accept="image/x-png,image/gif,image/jpeg"
              />
            </label>
          </>
        )}
        {downloadURL && (
          <code className="upload-snippet">{`![alt](${downloadURL})`}</code>
        )}
      </div>
    )
  }

  return (
    <div>
      Pexels
      <br />
      <Upload />
      <br />
      <div
        style={{
          height: 500,
          overflowY: 'scroll',
          paddingTop: 8,
          paddingBottom: 8,
          border: 'solid 1px black',
        }}
      >
        {loading && <span>Collection: Loading...</span>}
        {photos.length > 0 && (
          <div>
            {photos.map((doc) => (
              <div
                key={doc.id}
                style={{
                  border: 'solid 1px black',
                  margin: 8,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Link to={`/user/${doc.uid}`}>@{doc.uid}</Link>
                <br />
                <img src={doc.downloadURL} width={200} height={200} />
                <p>{moment(doc.createdAt?.toDate()).fromNow()}</p>
                <button onClick={() => handleDelete(doc)}>Delete</button>
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
    </div>
  )
}

export default Pexels
