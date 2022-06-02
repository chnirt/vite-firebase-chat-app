import {
  doc,
  serverTimestamp,
  setDoc,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore'

import { db } from '.'

export const addDocument = async (
  collectionName = 'todos',
  data = {},
  options = {
    generated: false,
    ref: null,
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
    docRef = await addDoc(options.ref ?? collectionRef, formatData)
  } else {
    collectionRef = doc(collection(db, collectionName))
    docRef = await setDoc(options.ref ?? collectionRef, formatData)
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
