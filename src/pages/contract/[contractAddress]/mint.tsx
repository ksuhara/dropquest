import { useAddress, useMetamask, useSignatureDrop, useNetwork, useNetworkMismatch } from '@thirdweb-dev/react'

import type { NextPage } from 'next'

import { ChainId, SignedPayload721WithQuantitySignature } from '@thirdweb-dev/sdk'
import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useEffect, useState } from 'react'
import { Typography } from '@mui/material'

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

        alert(`Succesfully minted NFT!`)
      } catch (error: any) {
        alert(error?.message)
      }
    }
  }

  return (
    <Box>
      {address ? (
        <Box sx={{ mr: 2, justifyItems: 'center' }}>
          <Box>{metadata?.image && <img src={metadata.image} alt='nftimage' width={300} height={300} />}</Box>
          {metadata?.name && <Typography>{metadata.name}</Typography>}
          <Button onClick={() => claimWithSignature()} variant='contained' size='large'>
            claimWithSignature
          </Button>
        </Box>
      ) : (
        <Button onClick={() => connectWithMetamask()} variant='contained' size='large'>
          Connect Wallet
        </Button>
      )}
    </Box>
  )
}

export default Mint
