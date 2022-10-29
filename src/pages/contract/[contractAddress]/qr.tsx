/* eslint-disable @typescript-eslint/no-unused-vars */
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useAddress } from '@thirdweb-dev/react'
import { AnyAaaaRecord } from 'dns'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { useRouter } from 'next/router'
import { useQRCode } from 'next-qrcode'
import { useEffect, useState } from 'react'
import initializeFirebaseClient from 'src/configs/initFirebase'
import useFirebaseUser from 'src/hooks/useFirebaseUser'

const ContractQR = () => {
  const router = useRouter()
  const { contractAddress } = router.query
  const basePath = router.basePath ? router.basePath : 'http://localhost:3000'
  const { user, isLoading: loadingAuth } = useFirebaseUser()
  const { db } = initializeFirebaseClient()
  const { Canvas } = useQRCode()

  interface Key {
    key: string
    isUsed: boolean
  }

  const [contractData, setContractData] = useState<any>()
  const [isLoading, setIsLoading] = useState(true)
  const [qrKey, setQrKey] = useState('')

  useEffect(() => {
    const filterValidKeys = (keys: Key[]) => {
      const result = keys.filter(key => key.isUsed == false)

      return result
    }

    const syncData = async () => {
      if (!contractAddress) return
      const docRef = doc(db, 'contracts', contractAddress as string)
      onSnapshot(docRef, doc => {
        if (doc.exists()) {
          setContractData({
            ...doc.data(),
            id: doc.id
          })
          const keys = filterValidKeys(doc.data().keys)
          setQrKey(keys[0].key)
        } else {
          setContractData(null)
        }
        setIsLoading(false)
      })
    }
    syncData()
  }, [contractAddress, db])

  return (
    <Grid container spacing={4}>
      {contractData && user?.uid == contractData.owner && !isLoading ? (
        <>
          <Grid item xs={12} md={6}>
            {/* <Card sx={{ mx: 'auto' }}>
              <CardContent> */}
            <img src={contractData.image} width={'100%'} alt='contract image'></img>
            {/* </CardContent> */}
            {/* </Card> */}
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
                <Canvas
                  text={`${basePath}/contract/${contractAddress}/mint?key=${qrKey}`}
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
                <Box>
                  {basePath && (
                    <Button
                      variant='contained'
                      href={`${basePath}/contract/${contractAddress}/edition-mint?key=${qrKey}`}
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
