import { firestore } from 'firebase-admin'
import type { NextApiRequest, NextApiResponse } from 'next'
import { buffer } from 'micro'
import randomstring from 'randomstring'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-08-01'
})

import initializeFirebaseServer from '../../configs/initFirebaseAdmin'

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function stripeWebhook(req: NextApiRequest, res: NextApiResponse) {
  const sig = req.headers['stripe-signature'] as string

  const buf = await buffer(req)
  try {
    stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_ENDPOINT_SECRET || '')
  } catch (err: any) {
    console.log(err)
    res.status(400).send(`Webhook Error: ${err.message}`)
  }
  const parsedBody = JSON.parse(buf.toString())
  const { db } = initializeFirebaseServer()
  const docRef = db.collection('contracts').doc(parsedBody.data.object.metadata.contractAddress)
  const doc = await docRef.get()
  const keys = doc.data()!.keys
  for (let i = 0; i < 10; i++) {
    const rand = randomstring.generate({
      length: 12,
      charset: 'alphanumeric',
      capitalization: 'lowercase'
    })
    keys.push({
      key: rand,
      isUsed: false
    })
  }
  docRef.update({
    keys: keys,
    updatedAt: firestore.FieldValue.serverTimestamp()
  })

  res.send(200)
}
