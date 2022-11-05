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

  const batch = db.batch()

  for (let i = 0; i < ticketsAdd; i++) {
    const rand = randomstring.generate({
      length: 16,
      charset: 'alphanumeric',
      capitalization: 'lowercase'
    })
    const keysRef = db.collection(`chain/${chain}/contracts/${contractAddress}/keys`).doc(rand)

    batch.set(keysRef, {
      keyStatus: 'stock'
    })
  }

  await batch.commit()

  res.send(200)
}
