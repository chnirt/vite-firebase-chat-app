// https://www.javascripttutorial.net/javascript-apply-method/
// https://bobbyhadz.com/blog/javascript-remove-null-values-from-array
// https://stackoverflow.com/questions/70571720/firestore-query-snapshot-foreach-seems-to-be-overwriting-products-state
// https://stackoverflow.com/questions/50807905/are-firestore-updates-charged-the-same-cost-as-writes
import { signOut } from 'firebase/auth'
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  writeBatch,
  collectionGroup,
} from 'firebase/firestore'

import { auth, db } from '.'

export const addDocument = async (ref, data = {}) => {
  const formatData = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
  switch (ref.type) {
    case 'document': {
      const docRef = await setDoc(ref, formatData)
      return docRef
    }
    case 'collection': {
      const docRef = await addDoc(ref, formatData)
      return docRef
    }
    default: {
      return
    }
  }
}

export const getDocument = async (ref) => {
  const docSnap = await getDoc(ref)

  if (docSnap.exists()) {
    // console.log('Document data:', docSnap.data())
    return docSnap.data()
  } else {
    // doc.data() will be undefined in this case
    // console.log('No such document!')
    throw Error('No such document!')
  }
}

export const updateDocument = async (ref, data = {}) => {
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export const getDocRef = (collectionName = 'todos', ...pathSegments) =>
  doc(db, collectionName, ...pathSegments)

export const getColRef = (collectionName = 'todos', ...pathSegments) =>
  collection(db, collectionName, ...pathSegments)

export const getColGroupRef = (collectionName = 'todos', ...pathSegments) =>
  collectionGroup(db, collectionName, ...pathSegments)

export const deleteDocument = async (
  collectionName = 'todos',
  ...pathSegments
) => {
  const docRef = getDocRef(collectionName, ...pathSegments)
  await deleteDoc(docRef)
}

export const getBatch = () => writeBatch(db)

export const signOutFirebase = () => signOut(auth)
