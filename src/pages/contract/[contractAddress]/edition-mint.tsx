/* eslint-disable @typescript-eslint/no-unused-vars */
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
import Grid from '@mui/material/Grid'
import initializeFirebaseClient from 'src/configs/initFirebase'
import { getDoc, doc } from 'firebase/firestore'

const Mint: NextPage = () => {
  const router = useRouter()
  const { key, contractAddress } = router.query

  const address = useAddress()
  const connectWithMetamask = useMetamask()
  const isMismatch = useNetworkMismatch()
  const [, switchNetwork] = useNetwork()

  const edition = useContract(contractAddress as string, 'edition')
  const { db } = initializeFirebaseClient()

  const [contractData, setContractData] = useState<any>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const syncData = async () => {
      if (!contractAddress) return
      const docRef = doc(db, 'contracts', contractAddress as string)
      const docdata = await getDoc(docRef)
      if (docdata.exists()) {
        setContractData({
          ...docdata.data(),
          id: docdata.id
        })
      }
    }
    syncData()
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
    <Grid container spacing={4}>
      <Grid item xs={12} md={6}>
        {contractData?.image ? (
          <img src={contractData.image} alt='nftimage' width={'100%'} />
        ) : (
          <Skeleton variant='rectangular' width={'100%'} sx={{ mx: 'auto' }} />
        )}
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ mx: 'auto', minHeight: '100%' }}>
          <CardContent>
            {contractData ? (
              <>
                <Typography variant='h2'>{contractData.name}</Typography>
                <Typography variant='subtitle2'>{contractAddress}</Typography>
                <Typography variant='subtitle2'>created by:{contractAddress}</Typography>
              </>
            ) : (
              <></>
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
      </Grid>
    </Grid>
  )
}

export default Mint
