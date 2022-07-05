import { useState, useCallback, useEffect } from 'react'
import moment from 'moment'
import { Link } from 'react-router-dom'
import { getDocs, orderBy, query } from 'firebase/firestore'

import {
  deleteStorageFile,
  uploadStorageBytesResumable,
} from '../../firebase/storage'
import { useAuth } from '../../context'
import { addDocument, deleteDocument, getColRef } from '../../firebase/service'
import { logAnalyticsEvent } from '../../firebase/analytics'
import { eventNames } from '../../constants'
import { useFetch } from '../../firebase/hooks'

const Pexels = () => {
  const { user } = useAuth()
  const {
    loading,
    data: photos,
    moreLoading,
    loadedAll,
    handleLoadMore,
  } = useFetch('photos', {
    limit: 3,
  })
  const [uploading, setUploading] = useState(false)
  const [state, setState] = useState(null)
  const [progress, setProgress] = useState(0)
  const [downloadURL, setDownloadURL] = useState(null)
  const [relationshipList, setRelationshipList] = useState([])

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

  useEffect(() => {
    getRelationship()
  }, [getRelationship])

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
            {photos.map((doc) => {
              const id = doc.id
              const downloadURL = doc.downloadURL
              const createdAt = doc.createdAt
              const foundRelationship = findRelationship(doc.uid)
              const username = foundRelationship?.username
              return (
                <div
                  key={`photo-${id}`}
                  style={{
                    border: 'solid 1px black',
                    margin: 8,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Link to={`/user/${username}`}>@{username}</Link>
                  <br />
                  <img src={downloadURL} width={200} height={200} />
                  <p>{moment(createdAt?.toDate()).fromNow()}</p>
                  <button onClick={() => handleDelete(doc)}>Delete</button>
                </div>
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
    </div>
  )
}

export default Pexels
