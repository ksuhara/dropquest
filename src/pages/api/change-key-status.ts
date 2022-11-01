import { NextApiRequest, NextApiResponse } from 'next/types'

import initializeFirebaseServer from '../../configs/initFirebaseAdmin'

export default async function fetchTwitterUser(req: NextApiRequest, res: NextApiResponse) {
  const { contractAddress, keyString, chain } = JSON.parse(req.body)

  const { db } = initializeFirebaseServer()

  const docRef = db.collection(`chain/${chain}/contracts`).doc(contractAddress)

  const doc = await docRef.get()
  const keys = doc.data()!.keys
  const index = keys.findIndex((element: any) => element.key == keyString)
  keys[index] = {
    key: keyString,
    keyStatus: 'pending'
  }
  docRef.update({ keys })

  res.status(200).json('updated')
}
