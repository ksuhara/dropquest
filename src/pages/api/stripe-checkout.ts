import type { NextApiRequest, NextApiResponse } from 'next/types'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2022-08-01'
})

export default async function stripeCheckout(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { contractAddress, plan, chain } = JSON.parse(req.body)
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: plan == 10 ? 'price_1LvZIeDh9iB9gv9LzXUycEkx' : 'price_1Lva4HDh9iB9gv9LLqEW4FGm',
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: `${req.headers.origin}/?success=true`,
        cancel_url: `${req.headers.origin}/?canceled=true`,
        metadata: {
          contractAddress,
          plan,
          chain
        }
      })

      return res.status(200).json({
        session_id: session.id,
        checkout_url: session.url
      })
    } catch (err: any) {
      res.status(err.statusCode || 500).json(err.message)
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}
