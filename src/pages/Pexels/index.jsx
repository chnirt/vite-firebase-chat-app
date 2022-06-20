import { useState, useCallback, useEffect } from 'react'
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
} from 'firebase/firestore'
import moment from 'moment'
import { Link } from 'react-router-dom'

import { deleteStorageFile, uploadStorageBytesResumable } from '../../firebase/storage'
import { useAuth } from '../../context'
import { addDocument, deleteDocument } from '../../firebase/service'
import { logAnalyticsEvent } from '../../firebase/analytics'
import { eventNames } from '../../constants'
import { db } from '../../firebase'

const LIMIT = 3

const Pexels = () => {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [state, setState] = useState(null)
  const [progress, setProgress] = useState(0)
  const [downloadURL, setDownloadURL] = useState(null)

  const [loading, setLoading] = useState(false)
  const [photos, setPhotos] = useState([])
  const [last, setLast] = useState(null)
  const [loadedAll, setLoadedAll] = useState(false)
  const [moreLoading, setMoreLoading] = useState(false)

  const onProgress = useCallback(
    ({ state, progress }) => {
      setState(state)
      setProgress(progress)
    },
    [setState, setProgress]
  )

  const onComplete = useCallback(
    ({ downloadURL, url }) => {
      setDownloadURL(downloadURL)

      addDocument('photos', {
        downloadURL,
        url,
        uid: user.uid,
      })

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

  const fetchPhotos = useCallback(async () => {
    if (user?.uid === null) return

    // Query the first page of docs
    const first = query(
      collection(db, 'photos'),
      orderBy('createdAt', 'desc'),
      limit(LIMIT)
    )

    onSnapshot(first, (querySnapshot) => {
      const docs = querySnapshot.docs
      const data = docs.map((docSnapshot) => {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data(),
          ref: docSnapshot.ref
        }
      })
      setPhotos(data)

      const lastVisible = docs[docs.length - 1]
      setLast(lastVisible)
      setLoadedAll(docs.length < LIMIT)
    })
  }, [])

  const fetchMorePhotos = useCallback(async () => {
    const next = query(
      collection(db, 'photos'),
      orderBy('createdAt', 'desc'),
      limit(LIMIT),
      startAfter(last)
    )

    onSnapshot(next, (querySnapshot) => {
      const docs = querySnapshot.docs
      const data = docs.map((docSnapshot) => {
        return {
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }
      })
      setPhotos((prevState) => [...prevState, ...data])

      const lastVisible = docs[docs.length - 1]
      setLast(lastVisible)
      setLoadedAll(docs.length < LIMIT)
    })
  }, [last])

  const handleDelete = useCallback(async (doc) => {
    await deleteDocument('photos', doc.id)
    await deleteStorageFile(doc.url)
  }, [])

  const handleLoadMore = useCallback(() => {
    setMoreLoading(true)
    fetchMorePhotos().finally(() => {
      setMoreLoading(false)
    })
  }, [fetchMorePhotos])

  useEffect(() => {
    setLoading(true)
    fetchPhotos().finally(() => {
      setLoading(false)
    })
  }, [fetchPhotos])

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
                <Link to={`/users/${doc.uid}`}>@{doc.uid}</Link><br />
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
