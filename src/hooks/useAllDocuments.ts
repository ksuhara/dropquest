import { collectionGroup, DocumentData, onSnapshot, query, where } from 'firebase/firestore'
import { useEffect, useState } from 'react'

import initializeFirebaseClient from '../configs/initFirebase'

// Helpful hook for you to read the currently authenticated user's document from Firestore using their ID
export default function useFirebaseDocument() {
  const { db } = initializeFirebaseClient()
  const [isLoading, setIsLoading] = useState(true)
  const [contractsDocument, setContractsDocument] = useState<DocumentData[] | null>(null)

  useEffect(() => {
    if (db) {
      ;(async () => {
        const q = query(collectionGroup(db, 'contracts'), where('visibility.isPublic', '==', true))
        const contractListner = onSnapshot(q, async querySnapshot => {
          const a: any = []
          querySnapshot.forEach(doc => {
            a.push(doc.data())
          })
          setContractsDocument(a)
          setIsLoading(false)
        })

        return () => {
          contractListner()
        }
      })()
    } else {
      setIsLoading(false)
    }
  }, [db])

  return { isLoading, contractsDocument }
}
