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
      <Box marginBottom={4}>
        <TabContext value={tabMode}>
          <TabList onChange={handleTabChange} aria-label='simple tabs example'>
            <Tab value='ongoing' label={`${t('LP:upcoming_tab')}`} />
            <Tab value='past' label={`${t('LP:past_tab')}`} />
          </TabList>
        </TabContext>
      </Box>
      <Grid container spacing={6}>
        {(tabMode == 'ongoing' ? ongoingEvent : pastEvent)?.map(contract => {
          return (
            <Grid item xs={12} key={contract.contractAddress}>
              <Link href={`/contract/${contract.chain}/${contract.contractAddress}`}>
                <Card>
                  <Grid container>
                    <Grid item xs={3} md={2}>
                      <Img src={contract.image} alt='img'></Img>
                    </Grid>
                    <Grid item xs={9} md={10}>
                      <CardHeader title={contract.name} action={<Chip label={`${contract.chain}`} />}></CardHeader>
                      <CardContent>
                        <Grid container justifyContent='space-between'>
                          <Grid item>
                            <Typography noWrap>{contract.contractAddress}</Typography>
                          </Grid>
                          <Grid item>
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
