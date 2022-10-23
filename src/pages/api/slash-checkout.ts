import axios from 'axios'
import sha256 from 'crypto-js/sha256'
import type { NextApiRequest, NextApiResponse } from 'next/types'
import randomstring from 'randomstring'

interface AxiosResponse {
  url: any
  token: any
}

export default async function slashCheckout(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { contractAddress, plan } = JSON.parse(req.body)

      console.log(1)

      const amount = plan /* Price */
      const amountType = 'USD' /* Currency of the Price  */
      const rand = randomstring.generate({
        length: 16,
        charset: 'alphanumeric',
        capitalization: 'lowercase'
      })
      const orderCode = `${contractAddress}_${plan}_${rand}`
      console.log(2)
      const authenticationToken = process.env.SLASH_AUTH_TOKEN
      const hashToken = process.env.SLASH_HASH_TOKEN
      console.log(3)
      const raw = orderCode + '::' + amount + '::' + hashToken
      const hashHex = sha256(raw).toString()
      console.log(4)
      const requestObj = {
        identification_token: authenticationToken,
        order_code: orderCode,
        verify_token: hashHex,
        amount: amount,
        amount_type: amountType
      }
      console.log(requestObj)
      const paymentRequestUrl = 'https://testnet.slash.fi/api/v1/payment/receive'
      const result = await axios.post<AxiosResponse>(paymentRequestUrl, requestObj)
      console.log(6)
      console.log(result)

      return res.status(200).json({
        payment_id: result.data.token,
        checkout_url: result.data.url
      })
    } catch (err: any) {
      res.status(err.statusCode || 500).json(err.message)
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}
