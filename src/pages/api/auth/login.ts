import { ThirdwebSDK } from '@thirdweb-dev/sdk'
import type { NextApiRequest, NextApiResponse } from 'next/types'

import initializeFirebaseServer from '../../../configs/initFirebaseAdmin'

export default async function login(req: NextApiRequest, res: NextApiResponse) {
  // Grab the login payload the user sent us with their request.
  const loginPayload = req.body.payload

  // Set this to your domain to prevent signature malleability attacks.
  const domain = 'regidrop.vercel.app'

  console.log(process.env.ADMIN_PRIVATE_KEY!, 'process.env.ADMIN_PRIVATE_KEY!,')

  console.log(1)
  const sdk = ThirdwebSDK.fromPrivateKey(
    // https://portal.thirdweb.com/sdk/set-up-the-sdk/securing-your-private-key
    process.env.ADMIN_PRIVATE_KEY!,
    'goerli' // configure this to your network
  )
  console.log(2)

  let address
  try {
    console.log(3)
    // Verify the address of the logged in client-side wallet by validating the provided client-side login request.
    address = sdk.auth.verify(domain, loginPayload)
  } catch (err) {
    // If the login request is invalid, return an error.
    console.log(4)
    console.error(err)

    return res.status(401).send('Unauthorized')
  }

  console.log(5)
  console.log('test')

  // Initialize the Firebase Admin SDK.
  const { auth } = initializeFirebaseServer()

  // Generate a JWT token for the user to be used on the client-side.
  const token = await auth.createCustomToken(address)

  // Send the token to the client to sign in with.
  return res.status(200).json({ token })
}
