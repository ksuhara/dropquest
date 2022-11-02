import { firestore } from 'firebase-admin'
import type { NextApiRequest, NextApiResponse } from 'next/types'
import randomstring from 'randomstring'

import initializeFirebaseServer from '../../configs/initFirebaseAdmin'

export default async function slashWebhook(req: NextApiRequest, res: NextApiResponse) {
  const { orderCode, result } = JSON.parse(req.body)
  const splittedCode = orderCode.splits('_')
  console.log(splittedCode, 'splittedCode')
  const contractAddress = splittedCode[0]
  const ticketsAdd = splittedCode[1]
  const chain = splittedCode[2]
  console.log(result, 'result')
  const { db } = initializeFirebaseServer()
  const docRef = db.collection(`chain/${chain}/contracts`).doc(contractAddress)
  const doc = await docRef.get()
  const keys = doc.data()!.keys

  for (let i = 0; i < ticketsAdd; i++) {
    const rand = randomstring.generate({
      length: 16,
      charset: 'alphanumeric',
      capitalization: 'lowercase'
    })
    keys.push({
      key: rand,
      keyStaus: 'stock'
    })
  }
  docRef.update({
    keys: keys,
    updatedAt: firestore.FieldValue.serverTimestamp()
  })

  res.send(200)
}
