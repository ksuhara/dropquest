import { ThirdwebSDK } from '@thirdweb-dev/sdk'
import { firestore } from 'firebase-admin'
import type { NextApiRequest, NextApiResponse } from 'next/types'
import randomstring from 'randomstring'

import initializeFirebaseServer from '../../configs/initFirebaseAdmin'

export default async function registerNFTContract(req: NextApiRequest, res: NextApiResponse) {
  if (!(req.headers && req.headers.authorization)) {
    return res.status(400).json({ error: 'Missing Authorization header value' })
  }

  const { nftAddress, address, chain } = JSON.parse(req.body)
  const { db, auth } = initializeFirebaseServer()
  const decoded = await auth.verifyIdToken(req.headers.authorization)

  if (decoded.uid != address) {
    return res.status(400).json({ error: 'Invalid Authorization header value' })
  }

  const docRef = db.collection(`chain/${chain}/contracts/`).doc(nftAddress)
  const data = await docRef.get()
  if (data.exists) {
    return res.status(400).send({ error: 'already registered' })
  }
  const sdk = new ThirdwebSDK(chain)
  const nftCollection = await sdk.getContract(nftAddress)
  const contractOwner = await nftCollection.owner.get()
  const contractMetadata = await nftCollection.metadata.get()
  const minters = await nftCollection.roles.get('minter')
  if (contractOwner != address) {
    return res.status(400).send({ error: 'not an owner' })
  }
  if (!minters.includes('0x6a84E19A4801E5F003ea9d3202a38AE6a864DfdC')) {
    return res.status(400).send({ error: 'please add 0x6a84E19A4801E5F003ea9d3202a38AE6a864DfdC to minter' })
  }

  const date = new Date()
  const endTime = new Date(date.setMonth(date.getMonth() + 1))

  const batch = db.batch()

  batch.set(
    docRef,
    {
      name: contractMetadata.name,
      symbol: contractMetadata.symbol,
      image: contractMetadata.image,
      description: contractMetadata.description,
      contractAddress: nftAddress,
      owner: address,
      createdAt: firestore.FieldValue.serverTimestamp(),
      contractType: 'edition',
      chain: chain,
      visibility: {
        isPublic: false,
        startTime: new Date(),
        endTime: endTime
      },
      location: { name: '', latLng: { lat: 35.66, lng: 139.71 }, isActive: false },
      twitterGate: { twitterId: '', isActive: false },
      nftGate: { contractAddress: '', chainId: 'ethereum', isActive: false },
      allowed: ''
    },
    { merge: true }
  )

  // リファラルがあれば数字変える
  for (let i = 0; i < 30; i++) {
    const rand = randomstring.generate({
      length: 16,
      charset: 'alphanumeric',
      capitalization: 'lowercase'
    })
    const keysRef = db.collection(`chain/${chain}/contracts/${nftAddress}/keys`).doc(rand)

    batch.set(keysRef, {
      keyStatus: 'stock'
    })
  }

  await batch.commit()

  res.status(200).json('registered')
}
