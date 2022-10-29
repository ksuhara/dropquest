import { NextApiRequest, NextApiResponse } from 'next/types'
import { getToken } from 'next-auth/jwt'
import { getSession } from 'next-auth/react'
import initializeFirebaseServer from 'src/configs/initFirebaseAdmin'
import { TwitterApi } from 'twitter-api-v2'

export default async function verifyTwitterGate(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const session = await getSession({ req })

  console.log(token)
  console.log(session)

  const { contractAddress } = JSON.parse(req.body)
  const { db } = initializeFirebaseServer()
  console.log(contractAddress)

  const docRef = db.collection('contracts').doc(contractAddress)
  const document = await docRef.get()
  if (!document.exists) {
    return res.status(400).send({ error: 'no such data' })
  }
  const data = document.data()

  const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN || '')
  const readOnlyClient = twitterClient.readWrite

  const { relationship } = await readOnlyClient.v1.friendship({
    source_id: token?.sub,
    target_screen_name: data?.twitterGate.twitterId
  })

  const followed = relationship.target.following

  res.status(200).json(followed)
}
