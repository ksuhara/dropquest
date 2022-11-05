import { NextApiRequest, NextApiResponse } from 'next/types'

import initializeFirebaseServer from '../../configs/initFirebaseAdmin'

export default async function changeKeyStatus(req: NextApiRequest, res: NextApiResponse) {
  const { contractAddress, keyString, chain } = JSON.parse(req.body)

  const { db } = initializeFirebaseServer()

  const docRef = db.collection(`chain/${chain}/contracts/${contractAddress}/keys`).doc(keyString)
  await docRef.update({ keyStatus: 'pending' })

  res.status(200).json('updated')
}
