import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { GoogleMap, OverlayView, useLoadScript } from '@react-google-maps/api'
import Calendar from 'mdi-material-ui/Calendar'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { SyntheticEvent, useEffect, useState } from 'react'
import { formatDate } from 'src/@core/utils/format'
import useAllDocuments from 'src/hooks/useAllDocuments'

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'LP']))
    }
  }
}

const LP = () => {
  const { contractsDocument } = useAllDocuments()

  const { t } = useTranslation()

  const Img = styled('img')(({ theme }) => ({
    [theme.breakpoints.down('lg')]: {
      width: '12rem'
    },
    [theme.breakpoints.down('md')]: {
      width: '6rem'
    },
    [theme.breakpoints.up('lg')]: {
      width: '12rem'
    }
  }))

  const [tabMode, setTabValue] = useState<string>('ongoing')
  const [ongoingEvent, setOngoingEvent] = useState<any[]>([])
  const [pastEvent, setPastEvent] = useState<any[]>([])

  const handleTabChange = (event: SyntheticEvent, newValue: string) => {
    setTabValue(newValue)
  }

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLEMAPS_API_KEY || '',
    libraries: ['places', 'localContext']
  })
  const matches: boolean = useMediaQuery('(min-width:577px)')
  const containerStyle = {
    width: matches ? '60rem' : '20rem',
    height: matches ? '500px' : '200px'
  }

  useEffect(() => {
    if (!contractsDocument) return

    const filteredOngoing = contractsDocument.filter(contract => contract.visibility?.endTime?.toDate() > new Date())
    const filteredPast = contractsDocument.filter(contract => contract.visibility?.endTime?.toDate() <= new Date())

    setOngoingEvent(filteredOngoing)
    setPastEvent(filteredPast)
  }, [contractsDocument])

  return (
    <>
      <Typography variant='h3'>{t('common:omiyage_nft')}</Typography>
      <Typography variant='subtitle1' sx={{ marginY: 2 }}>
        {t('LP:description')}
      </Typography>

      <Grid container spacing={6} marginTop={8}>
        <Box marginLeft={2}>
          {isLoaded ? (
            <GoogleMap
              zoom={12}
              center={{ lat: 35.66, lng: 139.71 }}
              mapContainerStyle={containerStyle}
              options={{ disableDefaultUI: true }}
            >
              {ongoingEvent.map(ev => {
                return (
                  <>
                    <OverlayView
                      key={ev.contractAddress}
                      position={ev.location.latLng}
                      mapPaneName='overlayMouseTarget'
                    >
                      <Link href={`/contract/${ev.chain}/${ev.contractAddress}`}>
                        <img src={ev.image} width='30' alt={ev.image}></img>
                      </Link>
                    </OverlayView>
                  </>
                )
              })}
            </GoogleMap>
          ) : (
            <></>
          )}
        </Box>

        <Grid marginY={4} item xs={12}>
          <TabContext value={tabMode}>
            <TabList onChange={handleTabChange} aria-label='simple tabs example'>
              <Tab value='ongoing' label={`${t('LP:upcoming_tab')}`} />
              <Tab value='past' label={`${t('LP:past_tab')}`} />
            </TabList>
          </TabContext>
        </Grid>
        {(tabMode == 'ongoing' ? ongoingEvent : pastEvent)?.map(contract => {
          return (
            <Grid item xs={12} md={10} key={contract.contractAddress}>
              <Link href={`/contract/${contract.chain}/${contract.contractAddress}`}>
                <Card>
                  <Grid container>
                    <Grid item xs={3} md={3}>
                      <Img src={contract.image} alt='img'></Img>
                    </Grid>
                    <Grid item xs={9} md={9}>
                      <CardHeader title={contract.name} action={<Chip label={`${contract.chain}`} />}></CardHeader>
                      <CardContent>
                        <Grid container justifyContent='space-between'>
                          <Grid item xs={9} md={7}>
                            <Typography noWrap>{contract.contractAddress}</Typography>
                          </Grid>
                          <Grid item xs={9} md={5}>
                            <Grid container alignItems={'center'}>
                              <Calendar />
                              <Typography>
                                {contract.visibility?.startTime
                                  ? formatDate(contract.visibility?.startTime?.toDate())
                                  : '?'}
                                ~
                                {contract.visibility?.endTime
                                  ? formatDate(contract.visibility?.endTime?.toDate())
                                  : '?'}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Typography noWrap>{contract.description}</Typography>
                      </CardContent>
                    </Grid>
                  </Grid>
                </Card>
              </Link>
            </Grid>
          )
        })}
      </Grid>
    </>
  )
}

export default LP
