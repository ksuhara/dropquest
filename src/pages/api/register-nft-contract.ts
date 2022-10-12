import { ThirdwebSDK } from '@thirdweb-dev/sdk'
import type { NextApiRequest, NextApiResponse } from 'next'
import initializeFirebaseServer from '../../configs/initFirebaseAdmin'
import randomstring from 'randomstring'
import { firestore } from 'firebase-admin'

export default async function registerNFTContract(req: NextApiRequest, res: NextApiResponse) {
  const { nftAddress, address } = JSON.parse(req.body)
  const { db } = initializeFirebaseServer()

  const sdk = new ThirdwebSDK('goerli')
  const nftCollection = await sdk.getNFTCollection(nftAddress)
  const contractOwner = await nftCollection.owner.get()
  const contractMetadata = await nftCollection.metadata.get()
  console.log(contractMetadata)
  if (contractOwner != address) {
    res.status(400).json({
      message: 'not an owner'
    })
  }

  const docRef = db.collection('contracts').doc(nftAddress)

  const keys = []
  for (let i = 0; i < 30; i++) {
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
  docRef.set(
    {
      name: contractMetadata.name,
      symbol: contractMetadata.symbol,
      contractAddress: nftAddress,
      owner: address,
      keys: keys,
      createdAt: firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  )
  res.status(200).json('mintSignature')
}
