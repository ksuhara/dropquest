import { ThirdwebSDK } from '@thirdweb-dev/sdk'
import type { NextApiRequest, NextApiResponse } from 'next/types'

import initializeFirebaseServer from '../../configs/initFirebaseAdmin'

export default async function generateMintSignature(req: NextApiRequest, res: NextApiResponse) {
  const { minterAddress, contractAddress, keyString, chain } = JSON.parse(req.body)
  const { db } = initializeFirebaseServer()

  const docRef = db.collection(`chain/${chain}/contracts`).doc(contractAddress)
  const doc = await docRef.get()
  if (!doc.exists) {
    res.status(400).json({
      message: 'No such contract'
    })
  }
  const keys = doc.data()!.keys

  const index = keys.findIndex((element: any) => element.key == keyString)
  const key = keys[index]
  keys[index] = {
    key: keyString,
    keyStatus: 'signatured',
    minter: minterAddress
  }

  const goerliSDK = ThirdwebSDK.fromPrivateKey(process.env.ADMIN_PRIVATE_KEY as string, chain)

  const type = doc.data()!.contractType
  if (key.keyStatus != 'signatured') {
    if (type == 'signature-drop') {
      const signatureDrop = goerliSDK.getSignatureDrop(contractAddress)

      const mintSignature = await (
        await signatureDrop
      ).signature.generate({
        to: minterAddress, // Can only be minted by the address we checked earlier
        price: '0', // Free!
        mintStartTime: new Date(0) // now
      })
      docRef.update({ keys })
      res.status(200).json(mintSignature)
    } else if (type == 'edition') {
      const edition = await goerliSDK.getContract(contractAddress, 'edition')
      const mintSignature = await edition.signature.generateFromTokenId({
        tokenId: 0,
        quantity: 1,
        to: minterAddress
      })
      docRef.update({ keys })
      console.log('mintSignature')
      res.status(200).json(mintSignature)
    }
  } else {
    console.log('key')

    res.status(400).json({
      message: 'key is already used'
    })
  }
}
