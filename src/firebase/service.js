import {
  doc,
  serverTimestamp,
  setDoc,
  collection,
  addDoc,
  deleteDoc,
} from 'firebase/firestore'

import { db } from '.'

export const addDocument = async (
  collectionName = 'todos',
  data = {},
  options = {
    generated: false,
  }
) => {
  const formatData = {
    ...data,
    createdAt: serverTimestamp(),
  }
  let collectionRef
  let docRef

  if (options.generated) {
    collectionRef = collection(db, collectionName)
    docRef = await addDoc(collectionRef, formatData)
  } else {
    collectionRef = doc(collection(db, collectionName))
    // later...
    docRef = await setDoc(collectionRef, formatData)
  }

  return docRef
}

export const deleteDocument = async (collectionName = 'todos', docId = '') => {
  await deleteDoc(doc(db, collectionName, docId))
}
