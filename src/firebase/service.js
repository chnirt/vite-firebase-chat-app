import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore'

import { db } from '.'
import { generateKeywords } from './utils'

export const getDocument = async (collectionName = 'todos', docId = '') => {
  try {
    const docRef = doc(db, collectionName, docId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      console.log('Document data:', docSnap.data())
    } else {
      // doc.data() will be undefined in this case
      console.log('No such document!')
    }
  } catch (error) {
    console.log(error)
  }
}

export const addDocument = async (
  collectionName = 'todos',
  data = {},
  options = {}
) => {
  const formatOptions = {
    generated: false,
    ref: null,
    keywords: [],
    ...options,
  }
  const formatData = {
    ...data,
    createdAt: serverTimestamp(),
    ...(formatOptions.keywords.length > 0
      ? {
        keywords: generateKeywords(
          formatOptions.keywords.map((keyword) => data[keyword] ?? '').join(' ') ??
          'Hello world'
        ),
      }
      : {}),
  }

  let docRef

  const collectionRef = collection(db, collectionName)

  if (formatOptions.generated) {
    docRef = await addDoc(formatOptions.ref ?? collectionRef, formatData)
  } else {
    const documentRef = doc(collection(db, collectionName))
    docRef = await setDoc(formatOptions.ref ?? documentRef, formatData)
  }

  return docRef
}

export const addSubCollection = async (
  docRef = doc(db, 'todos', '1234'),
  collectionName = 'subTodos',
  data = {}
) => {
  const colRef = collection(docRef, collectionName)
  docRef = await addDoc(colRef, data)
  return docRef
}

export const updateDocument = async (
  collectionName = 'todos',
  docId = '',
  data = {}
) => {
  const docRef = doc(db, collectionName, docId)

  // Update the timestamp field with the value from the server
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export const deleteDocument = async (collectionName = 'todos', docId = '') => {
  await deleteDoc(doc(db, collectionName, docId))
}
