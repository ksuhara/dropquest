import { useAddress, useMetamask, useContract, useNetwork, useNetworkMismatch } from '@thirdweb-dev/react'

import type { NextPage } from 'next'

import { ChainId, SignedPayload1155 } from '@thirdweb-dev/sdk'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useEffect, useState } from 'react'
import { Typography } from '@mui/material'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'

const Mint: NextPage = () => {
  const router = useRouter()
  const { key, contractAddress } = router.query

  const address = useAddress()
  const connectWithMetamask = useMetamask()
  const isMismatch = useNetworkMismatch()
  const [, switchNetwork] = useNetwork()

  const edition = useContract(contractAddress as string, 'edition')

  const [metadata, setMetadata] = useState<any>()

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!edition || metadata) return

      const unclaimed = await edition.contract?.getAll()
      setMetadata(unclaimed ? unclaimed[0].metadata : undefined)
    }
    fetchMetadata()
  }, [edition])

  async function claimWithSignature() {
    if (!address) {
      connectWithMetamask()

      return
    }

    if (isMismatch) {
      switchNetwork && switchNetwork(ChainId.Goerli)

      return
    }

    const signedPayloadReq = await fetch(`/api/generate-mint-signature`, {
      method: 'POST',
      body: JSON.stringify({
        minterAddress: address,
        contractAddress,
        keyString: key
      })
    })

    if (signedPayloadReq.status === 400) {
      alert("Looks like you don't own an early access NFT :( You don't qualify for the free mint.")

      return
    } else {
      try {
        const signedPayload = (await signedPayloadReq.json()) as SignedPayload1155

        const tx = await edition.contract?.signature.mint(signedPayload)

        alert(`Succesfully minted NFT!`)
      } catch (error: any) {
        alert(error?.message)
      }
    }
  }

  return (
    <Card sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
      <CardContent>
        <Box>
          {metadata?.image ? (
            <img src={metadata.image} alt='nftimage' width={300} height={300} />
          ) : (
            <Skeleton variant='rectangular' width={300} height={300} sx={{ mx: 'auto' }} />
          )}
        </Box>
        {metadata?.name && (
          <Typography variant='h6' component={'p'}>
            Token name: {metadata.name}
          </Typography>
        )}
        <Typography>You can mint this NFT without paying gas.</Typography>
        <Box marginTop={4}>
          {address ? (
            <Button onClick={() => claimWithSignature()} variant='contained' size='large'>
              claim
            </Button>
          ) : (
            <Button onClick={() => connectWithMetamask()} variant='contained' size='large'>
              Connect Wallet
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default Mint
