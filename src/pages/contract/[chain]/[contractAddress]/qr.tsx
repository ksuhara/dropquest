/* eslint-disable @typescript-eslint/no-unused-vars */
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useAddress } from '@thirdweb-dev/react'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { useRouter } from 'next/router'
import { useQRCode } from 'next-qrcode'
import { useEffect, useState } from 'react'
import initializeFirebaseClient from 'src/configs/initFirebase'
import useFirebaseUser from 'src/hooks/useFirebaseUser'

const ContractQR = () => {
  const router = useRouter()
  const { contractAddress, chain } = router.query
  const basePath =
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://regidrop-frontend.vercel.app/'
  const { user, isLoading: loadingAuth } = useFirebaseUser()
  const { db } = initializeFirebaseClient()
  const { Canvas } = useQRCode()

  interface Key {
    key: string
    keyStatus: 'stock' | 'pending' | 'signatured'
  }

  const [contractData, setContractData] = useState<any>()
  const [isLoading, setIsLoading] = useState(true)
  const [keys, setKeys] = useState<Key[]>([])
  useEffect(() => {
    const filterValidKeys = (keys: Key[]) => {
      const result = keys.filter(key => key.keyStatus == 'stock')

      return result
    }

    const syncData = async () => {
      if (!contractAddress) return
      const docRef = doc(db, `chain/${chain}/contracts`, contractAddress as string)
      onSnapshot(docRef, doc => {
        if (doc.exists()) {
          setContractData({
            ...doc.data(),
            id: doc.id
          })
          const filteredKeys = filterValidKeys(doc.data().keys)
          setKeys(filteredKeys)
        } else {
          setContractData(null)
        }
        setIsLoading(false)
      })
    }
    syncData()
  }, [contractAddress, db, chain])

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    if ((!user && !loadingAuth) || (!user?.uid == contractData?.owner && !loadingAuth)) {
      router.replace('/login')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingAuth])

  return (
    <Grid container spacing={4}>
      {contractData && user?.uid == contractData.owner && !isLoading ? (
        <>
          <Grid item xs={12} md={6}>
            <img src={contractData.image} width={'100%'} alt='contract image'></img>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ mx: 'auto', minHeight: '100%' }}>
              <CardContent>
                <Typography variant='h2' mb={2}>
                  {contractData.name}
                </Typography>
                <Typography variant='subtitle2' noWrap>
                  {contractAddress}
                </Typography>
                <Typography variant='subtitle2' noWrap>
                  created by:{contractAddress}
                </Typography>
                {keys.length ? (
                  <Canvas
                    text={`${basePath}/contract/${chain}/${contractAddress}/mint?key=${keys[0]}`}
                    options={{
                      type: 'image/jpeg',
                      quality: 0.3,
                      level: 'M',
                      scale: 4,
                      width: 360,
                      color: {
                        dark: '#9155FD',
                        light: '#FFF'
                      }
                    }}
                  />
                ) : (
                  <Typography variant='h4'>Out of Stock</Typography>
                )}

                <Box>
                  {basePath && (
                    <Button
                      variant='contained'
                      href={`${basePath}/contract/${chain}/${contractAddress}/edition-mint?key=${keys[0]}`}
                      target={'_blank'}
                    >
                      test
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </>
      ) : (
        <>Contract Owner can </>
      )}
    </Grid>
  )
}

export default ContractQR
