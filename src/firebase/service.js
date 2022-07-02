// https://www.javascripttutorial.net/javascript-apply-method/
// https://bobbyhadz.com/blog/javascript-remove-null-values-from-array
// https://stackoverflow.com/questions/70571720/firestore-query-snapshot-foreach-seems-to-be-overwriting-products-state
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore'

import { db } from '.'
import { generateKeywords } from './utils'

export const getDocuments = async (
  collectionName = 'todos',
  pathSegments = []
) => {
  const queryConstraints = pathSegments
    .map((segment) => {
      const queryConstraint = segment[0]
      const fieldPath = segment[1]
      const opStr = segment[2]
      const value = segment[3]
      if (queryConstraint === 'where') {
        return where(fieldPath, opStr, value)
      }
      return null
    })
    .filter((item) => item)

  const q = query.apply(null, [
    collection(db, collectionName),
    ...queryConstraints,
  ])
  const querySnapshot = await getDocs(q)
  const docs = querySnapshot.docs
  const data = docs.map((docSnapshot) => {
    return {
      id: docSnapshot.id,
      ...docSnapshot.data(),
    }
  })
  return data
}

export const getDocument = async (collectionName = 'todos', docId = '') => {
  const docRef = doc(db, collectionName, docId)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    console.log('Document data:', docSnap.data())
    return docSnap.data()
  } else {
    // doc.data() will be undefined in this case
    console.log('No such document!')
    throw Error('No such document!')
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
          formatOptions.keywords
            .map((keyword) => data[keyword] ?? '')
            .join(' ') ?? 'Hello world'
        ),
      }
      : {}),
  }

  let docRef

  if (formatOptions.generated) {
    const collectionRef = collection(db, collectionName)
    docRef = await addDoc(formatOptions.ref ?? collectionRef, formatData)
  } else {
    const documentRef = doc(collection(db, collectionName))
    docRef = await setDoc(formatOptions.ref ?? documentRef, formatData)
  }

  // const docRef = await setDoc(doc(db, 'users', userInput.uid), userData)

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

export const getDocRef = (collectionName = 'todos', ...pathSegments) =>
  doc(db, collectionName, ...pathSegments)

export const getColRef = (collectionName = 'todos', ...pathSegments) =>
  collection(db, collectionName, ...pathSegments)

export const deleteDocument = async (collectionName = 'todos', ...pathSegments) => {
  const docRef = getDocRef(collectionName, ...pathSegments)
  await deleteDoc(docRef)
}

