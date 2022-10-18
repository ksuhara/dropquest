import Button from '@mui/material/Button'
import { useAddress } from '@thirdweb-dev/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useFirebaseUser from 'src/hooks/useFirebaseUser'
import { getDoc, doc, onSnapshot } from 'firebase/firestore'
import initializeFirebaseClient from 'src/configs/initFirebase'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { AnyAaaaRecord } from 'dns'
import { ConsoleLine } from 'mdi-material-ui'
import { useQRCode } from 'next-qrcode'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'

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

  const filterValidKeys = (keys: Key[]) => {
    const result = keys.filter(key => key.isUsed == false)

    return result
  }

  useEffect(() => {
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
  }, [contractAddress])

  return (
    <>
      {contractData && user?.uid == contractData.owner && !isLoading ? (
        <>
          <h1>{contractData.name}</h1>
          <h3>{contractAddress}</h3>

          <Card sx={{ maxWidth: 345 }}>
            <CardContent>
              <Canvas
                text={`${basePath}/contract/${contractAddress}/mint?key=${qrKey}`}
                options={{
                  type: 'image/jpeg',
                  quality: 0.3,
                  level: 'M',
                  margin: 3,
                  scale: 4,
                  width: 300,
                  color: {
                    dark: '#9155FD',
                    light: '#FFF'
                  }
                }}
              />
              <Box marginRight={2}>
                {basePath && (
                  <a href={`${basePath}/contract/${contractAddress}/mint?key=${qrKey}`}>
                    <Typography
                      sx={{ fontSize: 8, mx: 4 }}
                    >{`${basePath}/contract/${contractAddress}/mint?key=${qrKey}`}</Typography>
                  </a>
                )}
              </Box>
            </CardContent>
          </Card>
        </>
      ) : (
        <>Contract Owner can </>
      )}
    </>
  )
}

export default ContractQR
