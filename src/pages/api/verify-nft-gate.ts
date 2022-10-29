import { ThirdwebSDK } from '@thirdweb-dev/sdk'
import { NextApiRequest, NextApiResponse } from 'next/types'
import { EvmChain, EvmNft } from '@moralisweb3/evm-utils'
import Moralis from 'moralis'

const chainIdToChain = {
  ethrerum: EvmChain.ETHEREUM,
  polygon: EvmChain.POLYGON,
  avalanche: EvmChain.AVALANCHE
}

export default async function verifyNFTGate(req: NextApiRequest, res: NextApiResponse) {
  const { contractAddress, chainId, minterAddress } = JSON.parse(req.body)
  let isOwner = false
  await Moralis.start({
    apiKey: process.env.MORALIS_API_KEY
  }).then(async () => {
    const chain = chainIdToChain[chainId as 'ethrerum' | 'polygon' | 'avalanche']
    const response = await Moralis.EvmApi.nft.getWalletNFTs({
      address: minterAddress,
      tokenAddress: contractAddress,
      chain
    })
    isOwner = response.result.length > 0
  })
  res.status(200).json(isOwner)
}
