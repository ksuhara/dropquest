import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { useAddress, useMetamask, useNetwork, useNetworkMismatch, useSignatureDrop } from '@thirdweb-dev/react'
import { ChainId, SignedPayload721WithQuantitySignature } from '@thirdweb-dev/sdk'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

const Mint: NextPage = () => {
  const router = useRouter()
  const { key, contractAddress } = router.query

  const address = useAddress()
  const connectWithMetamask = useMetamask()
  const isMismatch = useNetworkMismatch()
  const [, switchNetwork] = useNetwork()

  const signatureDrop = useSignatureDrop(contractAddress as string)

  const [metadata, setMetadata] = useState<any>()

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!signatureDrop) return

      const unclaimed = await signatureDrop.getAllUnclaimed()
      console.log(3)
      console.log(unclaimed, 'unclaimed')
      setMetadata(unclaimed[0])
    }
    fetchMetadata()
  }, [signatureDrop])

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
        const signedPayload = (await signedPayloadReq.json()) as SignedPayload721WithQuantitySignature

        const tx = await signatureDrop?.signature.mint(signedPayload)
        console.log(tx)

        alert(`Succesfully minted NFT!`)
      } catch (error: any) {
        alert(error?.message)
      }
    }
  }

  return (
    <Card sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
      <CardContent>
        <Box>{metadata?.image && <img src={metadata.image} alt='nftimage' width={300} height={300} />}</Box>
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
