import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from 'firebase/storage'

import { auth, storage } from '.'

export const uploadStorageBytesResumable = (
  file,
  onProgress,
  onError,
  onComplete
) => {
  // Get the file
  const extension = file.type.split('/')[1]

  const url = `uploads/${auth.currentUser.uid}/${Date.now()}.${extension}`
  const storageRef = ref(storage, url)

  const uploadTask = uploadBytesResumable(storageRef, file)
  // Listen for state changes, errors, and completion of the upload.
  uploadTask.on(
    'state_changed',
    (snapshot) => {
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      // console.log('Upload is ' + progress + '% done')
      typeof onProgress === 'function' &&
        onProgress({
          state: snapshot.state,
          progress,
        })
      switch (snapshot.state) {
        case 'paused':
        // console.log('Upload is paused')
        case 'running':
          // console.log('Upload is running')
          break
      }
    },
    (error) => {
      // A full list of error codes is available at
      // https://firebase.google.com/docs/storage/web/handle-errors
      typeof onError === 'function' && onError(error)
      switch (error.code) {
        case 'storage/unauthorized':
          // User doesn't have permission to access the object
          break
        case 'storage/canceled':
          // User canceled the upload
          break

        // ...

        case 'storage/unknown':
          // Unknown error occurred, inspect error.serverResponse
          break
      }
    },
    () => {
      // Upload completed successfully, now we can get the download URL
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        // console.log('File available at', downloadURL)
        typeof onComplete === 'function' && onComplete({ downloadURL, url })
      })
    }
  )
}

export const deleteStorageFile = async (url) => {
  try {
    // Create a reference to the file to delete
    const fileRef = ref(storage, url)

    // Delete the file
    const result = await deleteObject(fileRef)
    return result
  } catch (error) {
    console.log(error)
  }
}
