/* eslint-disable @typescript-eslint/no-unused-vars */
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useAddress } from '@thirdweb-dev/react'
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useQRCode } from 'next-qrcode'
import { useEffect, useState } from 'react'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import { filterValidKeys } from 'src/@core/utils/key'
import { Key } from 'src/@core/utils/types'
import initializeFirebaseClient from 'src/configs/initFirebase'
import useFirebaseUser from 'src/hooks/useFirebaseUser'

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['qr', 'common'])),
      locale
    }
  }
}

export async function getStaticPaths() {
  return {
    paths: [
      // { params: { chain: 'chain', contractAddress: 'contractAddress' }, locale: 'ja' },
      // { params: { chain: 'chain', contractAddress: 'contractAddress' }, locale: 'en' }
    ],
    fallback: true
  }
}

interface ContractQRProps {
  locale: string
}

const ContractQR = ({ locale }: ContractQRProps) => {
  const router = useRouter()
  const { t } = useTranslation()
  const { contractAddress, chain } = router.query
  const basePath = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://omiyage-nft.vercel.app/'
  const { user, isLoading: loadingAuth } = useFirebaseUser()
  const { db } = initializeFirebaseClient()
  const { Canvas } = useQRCode()

  const [contractData, setContractData] = useState<any>()
  const [isLoading, setIsLoading] = useState(true)
  const [keys, setKeys] = useState<Key[]>([])
  useEffect(() => {
    const syncData = async () => {
      if (!contractAddress) return
      const docRef = doc(db, `chain/${chain}/contracts`, contractAddress as string)
      onSnapshot(docRef, doc => {
        if (doc.exists()) {
          setContractData({
            ...doc.data(),
            id: doc.id
          })
        } else {
          setContractData(null)
        }
        setIsLoading(false)
      })

      const q = query(collection(db, `chain/${chain}/contracts/${contractAddress}/keys`))
      onSnapshot(q, querySnapshot => {
        const arr: any = []
        querySnapshot.forEach(doc => {
          arr.push({ ...doc.data(), key: doc.id })
        })
        console.log(arr)
        setKeys(arr)
      })
    }
    syncData()
  }, [contractAddress, db, chain])

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    console.log(user)
    console.log(contractData)

    if (
      (!user && !loadingAuth) ||
      ((!user?.uid == contractData?.owner || !user?.email == contractData?.allowed) && !loadingAuth)
    ) {
      router.replace(`/login/google?returnUrl=/contract/${chain}/${contractAddress}/qr`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingAuth])

  return (
    <Grid container spacing={4}>
      {contractData && (user?.uid == contractData.owner || user?.email == contractData?.allowed) && !isLoading ? (
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
                <Grid container direction='row'>
                  <Typography variant='subtitle2' sx={{ mr: 2 }}>
                    {t('common:contract_address')}:
                  </Typography>
                  <Typography variant='subtitle2' noWrap>
                    {contractAddress}
                  </Typography>
                </Grid>
                <Grid container direction='row'>
                  <Typography variant='subtitle2' sx={{ mr: 2 }}>
                    {t('common:created_by')}:
                  </Typography>
                  <Jazzicon diameter={20} seed={jsNumberForAddress(contractData.owner)} />
                  <Typography variant='subtitle2' noWrap>
                    {contractData.owner}
                  </Typography>
                </Grid>
                {keys.length ? (
                  <Canvas
                    text={`${basePath}/${locale}/contract/${chain}/${contractAddress}/edition-mint?key=${
                      filterValidKeys(keys)[0]?.key
                    }`}
                    options={{
                      type: 'image/jpeg',
                      quality: 0.3,
                      level: 'M',
                      scale: 4,
                      width: 320,
                      color: {
                        dark: '#9155FD',
                        light: '#FFF'
                      }
                    }}
                  />
                ) : (
                  <Typography variant='h4'>
                    {/* {t('qr:outofstock')} */}
                    在庫切れ
                  </Typography>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant='h4'>
                    {filterValidKeys(keys).length}/{keys.length}
                  </Typography>
                </Box>

                <Box>
                  {basePath == 'http://localhost:3000' && (
                    <Button
                      variant='contained'
                      href={`${basePath}/${locale}/contract/${chain}/${contractAddress}/edition-mint?key=${
                        filterValidKeys(keys)[0]?.key
                      }`}
                      target={'_blank'}
                    >
                      Read QR
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </>
      ) : (
        <>
          <CircularProgress />
        </>
      )}
    </Grid>
  )
}

export default ContractQR
