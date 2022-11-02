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
import { SyntheticEvent, useEffect, useState } from 'react'
import { formatDate } from 'src/@core/utils/format'
import useAllDocuments from 'src/hooks/useAllDocuments'

const LP = () => {
  const { contractsDocument } = useAllDocuments()

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

  interface Key {
    key: string
    keyStatus: 'stock' | 'pending' | 'signatured'
  }

  const filterValidKeys = (keys: Key[]) => {
    return keys.filter((key: any) => key.keyStatus == 'stock')
  }

  const [tabMode, setTabValue] = useState<string>('ongoing')
  const [ongoingEvent, setOngoingEvent] = useState<any[]>([])
  const [pastEvent, setPastEvent] = useState<any[]>([])

  const handleTabChange = (event: SyntheticEvent, newValue: string) => {
    setTabValue(newValue)
  }

  useEffect(() => {
    if (!contractsDocument) return

    const filteredOngoing = contractsDocument.filter(contract => contract.endTime?.toDate() > new Date())
    const filteredPast = contractsDocument.filter(contract => contract.endTime?.toDate() <= new Date())

    setOngoingEvent(filteredOngoing)
    setPastEvent(filteredPast)
  }, [contractsDocument])

  return (
    <>
      <Typography variant='h3'>Omiyage NFTs</Typography>
      <Box marginBottom={4}>
        <TabContext value={tabMode}>
          <TabList onChange={handleTabChange} aria-label='simple tabs example'>
            <Tab value='ongoing' label='Upcoming / ongoing' />
            <Tab value='past' label='Past' />
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
                                {contract.startTime ? formatDate(contract.startTime?.toDate()) : '?'} ~{' '}
                                {contract.endTime ? formatDate(contract.endTime?.toDate()) : '?'}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Typography noWrap>{contract.description}</Typography>
                        <Typography variant='h6'>
                          {filterValidKeys(contract.keys).length}/{contract.keys.length}
                        </Typography>
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
