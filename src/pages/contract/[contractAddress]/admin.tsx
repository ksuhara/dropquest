import Button from '@mui/material/Button'
import { useAddress, useContract, useUnclaimedNFTSupply, useClaimedNFTSupply } from '@thirdweb-dev/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useFirebaseUser from 'src/hooks/useFirebaseUser'
import { getDoc, doc } from 'firebase/firestore'
import initializeFirebaseClient from 'src/configs/initFirebase'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Grid from '@mui/material/Grid'
import ReactApexcharts from 'src/@core/components/react-apexcharts'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import Circle from 'mdi-material-ui/Circle'
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import { useTheme } from '@mui/material'
import { ApexOptions } from 'apexcharts'
import Plus from 'mdi-material-ui/Plus'

const ContractAdmin = () => {
  const router = useRouter()
  const { contractAddress } = router.query
  const { user, isLoading: loadingAuth } = useFirebaseUser()
  const { db } = initializeFirebaseClient()
  const theme = useTheme()
  const contractQuery = useContract(contractAddress as string)
  const { data: ClaimedSupply } = useClaimedNFTSupply(contractQuery.contract)
  const { data: unclaimedSupply } = useUnclaimedNFTSupply(contractQuery.contract)

  const [contractData, setContractData] = useState<any>()
  const [keys, setKeys] = useState<Key[]>([])

  const options: ApexOptions = {
    chart: {
      sparkline: { enabled: true }
    },
    colors: [theme.palette.primary.main, hexToRGBA(theme.palette.primary.main, 0.5)],
    stroke: { width: 0 },
    legend: { show: false },
    dataLabels: { enabled: false },
    labels: ['Used', 'Stock'],
    states: {
      hover: {
        filter: { type: 'none' }
      },
      active: {
        filter: { type: 'none' }
      }
    },
    plotOptions: {
      pie: {
        customScale: 0.9,
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              offsetY: 25
            },
            value: {
              offsetY: -15,
              formatter: value => `${value}`
            },
            total: {
              show: true,
              label: 'Total',
              formatter: value => `${value.globals.seriesTotals.reduce((total: number, num: number) => total + num)}`
            }
          }
        }
      }
    }
  }

  interface Key {
    key: string
    isUsed: boolean
  }

  const payment = async () => {
    const response = await fetch(`/api/stripe-checkout`, {
      method: 'POST',
      body: JSON.stringify({
        contractAddress
      })
    }).then(data => data.json())
    if (response.customer_id) {
      window.localStorage.setItem('customer_id', response.customer_id)
    }
    console.log(response, 'respense')
    console.log(response.checkout_url)
    router.push(response.checkout_url)
  }

  useEffect(() => {
    const syncData = async () => {
      if (!contractAddress) return
      const docRef = doc(db, 'contracts', contractAddress as string)
      const data = await getDoc(docRef)
      const testData = await data.data()
      setContractData(testData)
      const validKeys = testData!.keys.filter((key: any) => key.isUsed == false)
      setKeys(validKeys)
    }
    syncData()
  }, [contractAddress])

  return (
    <>
      {contractData && user?.uid == contractData.owner ? (
        <>
          <Grid container justifyContent='space-between' sx={{ my: 4 }}>
            <Grid item>
              <Typography variant='h2'>{contractData.name}</Typography>
              <Typography variant='subtitle1'>{contractAddress}</Typography>
            </Grid>
            <Grid item sx={{ mr: 4, my: 4 }}>
              <Button href={`/contract/${contractAddress}/qr`} variant='contained' size='large'>
                qrコード表示
              </Button>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader
                  title='Tokens Overview'
                  titleTypographyProps={{
                    sx: { lineHeight: '2rem !important', letterSpacing: '0.15px !important' }
                  }}
                />
                <CardContent
                  sx={{
                    '& .apexcharts-datalabel-label': {
                      lineHeight: '1.313rem',
                      letterSpacing: '0.25px',
                      fontSize: '0.875rem !important',
                      fill: `${theme.palette.text.secondary} !important`
                    },
                    '& .apexcharts-datalabel-value': {
                      letterSpacing: 0,
                      lineHeight: '2rem',
                      fontWeight: '500 !important'
                    }
                  }}
                >
                  <Grid container sx={{ my: [0, 4, 7.375] }}>
                    <Grid item xs={12} sm={6} sx={{ mb: [3, 0] }}>
                      <ReactApexcharts
                        type='donut'
                        height={220}
                        series={[contractData.keys.length - keys.length, keys.length]}
                        options={options}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ my: 'auto' }}>
                      <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                        {/* <CustomAvatar skin='light' sx={{ mr: 3 }} variant='rounded'>
                          <CurrencyUsd sx={{ color: 'primary.main' }} />
                        </CustomAvatar> */}
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant='body2'>Number of Tickets</Typography>
                          <Typography variant='h6'>
                            {keys.length}/{contractData.keys.length}
                          </Typography>
                        </Box>
                        <Button onClick={payment} variant='contained' size='large' sx={{ ml: 4 }} startIcon={<Plus />}>
                          購入
                        </Button>
                      </Box>
                      <Divider sx={{ my: 4 }} />
                      <Grid container>
                        <Grid item xs={6} sx={{ mb: 4 }}>
                          <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                            <Circle sx={{ mr: 1.5, fontSize: '0.75rem', color: 'primary.main' }} />
                            <Typography variant='body2'>Claimed Supply</Typography>
                          </Box>
                          <Typography sx={{ fontWeight: 600 }}>{ClaimedSupply?.toString()}</Typography>
                        </Grid>
                        <Grid item xs={6} sx={{ mb: 4 }}>
                          <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                            <Circle
                              sx={{ mr: 1.5, fontSize: '0.75rem', color: hexToRGBA(theme.palette.primary.main, 0.7) }}
                            />
                            <Typography variant='body2'>Unclaimed Supply</Typography>
                          </Box>
                          <Typography sx={{ fontWeight: 600 }}>{unclaimedSupply?.toString()}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Box marginTop={8}>
            <Typography variant='h4'>Customize gates</Typography>

            <FormGroup>
              <FormControlLabel control={<Switch defaultChecked />} label='Label' />
              <FormControlLabel disabled control={<Switch />} label='Disabled' />
            </FormGroup>
          </Box>
        </>
      ) : (
        <>Contract Owner can </>
      )}
    </>
  )
}

export default ContractAdmin
