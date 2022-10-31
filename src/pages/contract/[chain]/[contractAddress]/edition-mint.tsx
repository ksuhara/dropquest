/* eslint-disable @typescript-eslint/no-unused-vars */
import LoadingButton from '@mui/lab/LoadingButton'
import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Skeleton from '@mui/material/Skeleton'
import {
  useAddress,
  useContract,
  useDisconnect,
  useMetamask,
  useNetwork,
  useNetworkMismatch
} from '@thirdweb-dev/react'
import { ChainId, SignedPayload1155 } from '@thirdweb-dev/sdk'
import { doc, getDoc } from 'firebase/firestore'
import CheckOutline from 'mdi-material-ui/CheckOutline'
import Restore from 'mdi-material-ui/Restore'
import Twitter from 'mdi-material-ui/Twitter'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import initializeFirebaseClient from 'src/configs/initFirebase'

const Mint: NextPage = () => {
  const router = useRouter()
  const { key, contractAddress, chain } = router.query

  const address = useAddress()
  const connectWithMetamask = useMetamask()
  const disconnect = useDisconnect()
  const isMismatch = useNetworkMismatch()
  const [, switchNetwork] = useNetwork()
  const { data: session } = useSession()

  const edition = useContract(contractAddress as string, 'edition')
  const { db } = initializeFirebaseClient()

  const [contractData, setContractData] = useState<any>()
  const [NFTGateStatus, setNFTGateStatus] = useState('none')
  const [isNFTGateVerified, setIsNFTGateVerified] = useState(false)
  const [twitterGateStatus, setTwitterGateStatus] = useState('none')
  const [isTwitterGateVerified, setIsTwitterGateVerified] = useState(false)

  useEffect(() => {
    const syncData = async () => {
      if (!contractAddress) return
      const docRef = doc(db, `chain/${chain}/contracts`, contractAddress as string)
      const docdata = await getDoc(docRef)
      if (docdata.exists()) {
        setContractData({
          ...docdata.data(),
          id: docdata.id
        })
      }
    }
    syncData()
  }, [edition, db, contractAddress, chain])

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
      toast.error('error occured')

      return
    } else {
      try {
        const signedPayload = (await signedPayloadReq.json()) as SignedPayload1155

        const tx = await edition.contract?.signature.mint(signedPayload)

        toast.success(`Succesfully minted NFT!`)
      } catch (error: any) {
        toast.error(error?.message)
      }
    }
  }

  const verifyNFTGate = async () => {
    setNFTGateStatus('verifying')
    const verifyReq = await fetch(`/api/verify-nft-gate`, {
      method: 'POST',
      body: JSON.stringify({
        contractAddress: contractData.nftGate.contractAddress,
        chainId: contractData.nftGate.chainId,
        minterAddress: address
      })
    })
    if (verifyReq.status === 400) {
      toast.error('failed')
      setNFTGateStatus('done')

      return
    } else {
      const verifyResult = await verifyReq.json()
      setIsNFTGateVerified(verifyResult)
      if (verifyResult) {
        toast.success('Verify success!')
      } else {
        toast.error('This wallet dose not own token')
      }

      setNFTGateStatus('done')
    }
  }

  const verifyTwitterGate = async () => {
    setTwitterGateStatus('verifying')
    const verifyReq = await fetch(`/api/verify-twitter-gate`, {
      method: 'POST',
      body: JSON.stringify({
        contractAddress
      })
    })
    const verifyResult = await verifyReq.json()
    setIsTwitterGateVerified(verifyResult)
    setTwitterGateStatus('done')
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
                <Typography variant='h2' mb={2}>
                  {contractData.name}
                </Typography>
                <Typography variant='subtitle2'>{contractAddress}</Typography>
                <Typography variant='subtitle2'>created by:{contractAddress}</Typography>
              </>
            ) : (
              <></>
            )}
            <Typography>You can mint this NFT without paying gas.</Typography>
            <Box marginTop={4}>
              <>
                {contractData?.twitterGate?.isActive ? (
                  <Card sx={{ mb: 4 }}>
                    <CardHeader
                      title='Twitter Gate'
                      titleTypographyProps={{
                        sx: { fontSize: '6px !important' }
                      }}
                    ></CardHeader>
                    <CardContent>
                      <Typography>
                        Must follow{' '}
                        <Link href={`https://twitter.com/${contractData.twitterGate.twitterId}`} target='_blank'>
                          @{contractData.twitterGate.twitterId}
                        </Link>
                      </Typography>
                      {session ? (
                        <>
                          Signed in as {session.user?.name}
                          <IconButton onClick={() => signOut()} size='small'>
                            <Restore />
                          </IconButton>
                          {isTwitterGateVerified ? (
                            <Button variant='outlined' disabled startIcon={<CheckOutline />}>
                              verified
                            </Button>
                          ) : (
                            <LoadingButton
                              loading={twitterGateStatus == 'verifying'}
                              onClick={verifyTwitterGate}
                              variant='contained'
                            >
                              verify
                            </LoadingButton>
                          )}
                        </>
                      ) : (
                        <>
                          <Button variant='contained' color='info' onClick={() => signIn()} startIcon={<Twitter />}>
                            Sign in
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <></>
                )}
                {contractData?.nftGate?.isActive ? (
                  <Card sx={{ mb: 4 }}>
                    <CardHeader
                      title='NFT Gate'
                      titleTypographyProps={{
                        sx: { fontSize: '6px !important' }
                      }}
                    ></CardHeader>
                    <CardContent>
                      <Typography>Must own {contractData.nftGate.contractAddress} token</Typography>
                      {address ? (
                        <>
                          {isNFTGateVerified ? (
                            <Button variant='outlined' disabled startIcon={<CheckOutline />}>
                              verified
                            </Button>
                          ) : (
                            <Box>
                              <LoadingButton
                                variant='contained'
                                loading={NFTGateStatus == 'verifying'}
                                onClick={verifyNFTGate}
                              >
                                Check your balance
                              </LoadingButton>
                              {NFTGateStatus == 'done' && !isNFTGateVerified ? (
                                <IconButton onClick={() => disconnect()} size='small'>
                                  <Restore />
                                </IconButton>
                              ) : (
                                <></>
                              )}
                            </Box>
                          )}
                        </>
                      ) : (
                        <Button onClick={() => connectWithMetamask()} variant='contained'>
                          Connect Wallet
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <></>
                )}
              </>

              {address && contractData ? (
                <Button
                  fullWidth
                  disabled={
                    (contractData?.nftGate?.isActive && !isNFTGateVerified) ||
                    (contractData?.twitterGate?.isActive && !isTwitterGateVerified)
                  }
                  onClick={() => claimWithSignature()}
                  variant='contained'
                  size='large'
                >
                  claim
                </Button>
              ) : (
                <Button fullWidth onClick={() => connectWithMetamask()} variant='contained' size='large'>
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
