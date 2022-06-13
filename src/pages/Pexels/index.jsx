import { useState } from 'react'

import { uploadStorageBytesResumable } from '../../firebase/storage'

const Pexels = () => {
  const [uploading, setUploading] = useState(false)
  const [state, setState] = useState(null)
  const [progress, setProgress] = useState(0)
  const [downloadURL, setDownloadURL] = useState(null)

  const onProgress = ({ state, progress }) => {
    setState(state)
    setProgress(progress)
  }

  const onComplete = (url) => {
    setDownloadURL(url)
  }

  // Creates a Firebase Upload Task
  const handleUploadFile = async (e) => {
    try {
      const uploadTask = uploadStorageBytesResumable(e, onProgress, _, onComplete)

      // Pause the upload
      uploadTask.pause();

      // Resume the upload
      uploadTask.resume();

      // Cancel the upload
      uploadTask.cancel();
    } catch (error) {
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      Pexels
      <br />
      {uploading && <h3>{state} - {progress}%</h3>}
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

export default Pexels
