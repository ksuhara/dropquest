import { NextApiRequest, NextApiResponse } from 'next/types'
import { TwitterApi } from 'twitter-api-v2'

export default async function fetchTwitterUser(req: NextApiRequest, res: NextApiResponse) {
  const { screenName } = JSON.parse(req.body)

  const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN || '')
  const readOnlyClient = twitterClient.readOnly
  const user = await readOnlyClient.v1.user({ screen_name: screenName })
  console.log(user)

  res.status(200).json(user)
}
