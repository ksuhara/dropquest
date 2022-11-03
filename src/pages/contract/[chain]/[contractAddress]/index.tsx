/* eslint-disable @typescript-eslint/no-unused-vars */
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import Calendar from 'mdi-material-ui/Calendar'
import MapMarker from 'mdi-material-ui/MapMarker'
import { useRouter } from 'next/router'
import { useQRCode } from 'next-qrcode'
import { useEffect, useState } from 'react'
import { formatDate } from 'src/@core/utils/format'
import { filterValidKeys } from 'src/@core/utils/key'
import { Key } from 'src/@core/utils/types'
import initializeFirebaseClient from 'src/configs/initFirebase'
import useFirebaseUser from 'src/hooks/useFirebaseUser'

const Contract = () => {
  const router = useRouter()
  const { contractAddress, chain } = router.query
  const { user, isLoading: loadingAuth } = useFirebaseUser()
  const { db } = initializeFirebaseClient()

  const { isLoaded } = useLoadScript({ googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLEMAPS_API_KEY || '' })

  const matches: boolean = useMediaQuery('(min-width:577px)')

  const containerStyle = {
    width: matches ? '30rem' : '20rem',
    height: matches ? '300px' : '20px'
  }
  const [contractData, setContractData] = useState<any>()
  const [isLoading, setIsLoading] = useState(true)
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
    }
    syncData()
  }, [contractAddress, db, chain])

  return (
    <Grid container spacing={4}>
      {contractData && !isLoading ? (
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
                <Grid container alignItems={'center'}>
                  <Calendar />
                  <Typography>
                    {contractData.visibility?.startTime
                      ? formatDate(contractData.visibility?.startTime?.toDate())
                      : '?'}{' '}
                    ~ {contractData.visibility?.endTime ? formatDate(contractData.visibility?.endTime?.toDate()) : '?'}
                  </Typography>
                </Grid>
                <Box>
                  {isLoaded && contractData?.location ? (
                    <>
                      <Grid container alignItems={'center'}>
                        <MapMarker />
                        <Typography>{contractData?.location.name}</Typography>
                      </Grid>
                      <GoogleMap
                        zoom={10}
                        center={contractData?.location.latLng}
                        mapContainerStyle={containerStyle}
                        options={{ disableDefaultUI: true }}
                      >
                        <Marker position={contractData?.location.latLng}></Marker>
                      </GoogleMap>
                    </>
                  ) : (
                    <>loading...</>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </>
      ) : (
        <></>
      )}
    </Grid>
  )
}

export default Contract
