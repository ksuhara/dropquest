/* eslint-disable @typescript-eslint/no-unused-vars */
import Button from '@mui/material/Button'
import { useContract } from '@thirdweb-dev/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useFirebaseUser from 'src/hooks/useFirebaseUser'
import { getDoc, doc } from 'firebase/firestore'
import initializeFirebaseClient from 'src/configs/initFirebase'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Grid from '@mui/material/Grid'
import ReactApexcharts from 'src/@core/components/react-apexcharts'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Circle from 'mdi-material-ui/Circle'
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import { useTheme } from '@mui/material'
import { ApexOptions } from 'apexcharts'
import Plus from 'mdi-material-ui/Plus'
import CreditCardOutline from 'mdi-material-ui/CreditCardOutline'
import Ethereum from 'mdi-material-ui/Ethereum'
import InputLabel from '@mui/material/InputLabel'
import { styled } from '@mui/material/styles'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import { DataGrid, GridColumns, GridRowsProp } from '@mui/x-data-grid'

const EditionAdmin = () => {
  const router = useRouter()
  const { contractAddress } = router.query
  const { user, isLoading: loadingAuth } = useFirebaseUser()
  const { db } = initializeFirebaseClient()
  const theme = useTheme()

  // const sdk = useSDK()
  // const contractQuery = useContract(contractAddress as string)
  const edition = useContract(contractAddress as string, 'edition')

  // const { data: nfts } = useNFTs(contractQuery.contract)

  const [contractData, setContractData] = useState<any>()
  const [keys, setKeys] = useState<Key[]>([])
  const [rows, setRows] = useState<GridRowsProp>([])
  const [plan, setPlan] = useState(10)

  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

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
        contractAddress,
        plan
      })
    }).then(data => data.json())
    if (response.customer_id) {
      window.localStorage.setItem('customer_id', response.customer_id)
    }
    console.log(response, 'respense')
    console.log(response.checkout_url)
    router.push(response.checkout_url)
  }

  const slashPayment = async () => {
    const response = await fetch(`/api/slash-checkout`, {
      method: 'POST',
      body: JSON.stringify({
        contractAddress,
        plan
      })
    }).then(data => data.json())
    console.log(response, 'respense')
    router.push(response.checkout_url)
  }

  const OptionsWrapper = styled(Box)<BoxProps>(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }))

  const Img = styled('img')(({ theme }) => ({
    width: 40,
    height: 40
  }))

  const columns: GridColumns = [
    { field: 'id', headerName: 'ID', width: 80, editable: false },
    {
      field: 'image',
      headerName: 'image',
      width: 100,
      renderCell: params => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Img src={params.value} />
        </Box>
      )
    },
    { field: 'name', headerName: 'Name', editable: false },
    { field: 'supply', headerName: 'supply', type: 'number', width: 100, editable: false }
  ]

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

  // useEffect(() => {
  //   const syncNfts = async () => {
  //     console.log(rows)
  //     const newRows = nfts?.map(nft => {
  //       return {
  //         id: nft.metadata.id,
  //         supply: nft.supply,
  //         name: nft.metadata.name,
  //         image: nft.metadata.image
  //       }
  //     })
  //     if (!newRows) return
  //     setRows(newRows)
  //   }
  //   syncNfts()
  // }, [nfts])

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
              <Button
                href={`/contract/${contractAddress}/qr`}
                variant='contained'
                size='large'
                disabled={keys.length == 0}
              >
                qrコード表示
              </Button>
            </Grid>
          </Grid>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader
                  title='Mint Tickets Overview'
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
                  <Grid container sx={{ my: [0, 4] }}>
                    <Grid item xs={12} sm={6} sx={{ mb: [3, 0] }}>
                      <ReactApexcharts
                        type='donut'
                        height={120}
                        series={[contractData.keys.length - keys.length, keys.length]}
                        options={options}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ my: 'auto' }}>
                      <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant='body2'>Number of Tickets</Typography>
                          <Typography variant='h6'>
                            {keys.length}/{contractData.keys.length}
                          </Typography>
                        </Box>
                        <Button
                          onClick={handleOpen}
                          variant='contained'
                          size='large'
                          sx={{ ml: 4 }}
                          startIcon={<Plus />}
                        >
                          購入
                        </Button>
                        <Dialog
                          open={open}
                          onClose={handleClose}
                          aria-labelledby='user-view-plans'
                          aria-describedby='user-view-plans-description'
                          sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 650, pt: 8, pb: 8 } }}
                        >
                          <DialogTitle id='user-view-plans' sx={{ textAlign: 'center', fontSize: '1.5rem !important' }}>
                            Add Mint Ticket
                          </DialogTitle>

                          <DialogContent>
                            <DialogContentText
                              variant='body2'
                              sx={{ textAlign: 'center' }}
                              id='user-view-plans-description'
                            >
                              Choose the best plan for the user.
                            </DialogContentText>
                          </DialogContent>
                          <DialogContent
                            sx={{
                              display: 'flex',
                              pb: 4,
                              pl: [6, 15],
                              pr: [6, 15],
                              alignItems: 'center',
                              flexWrap: ['wrap', 'nowrap'],
                              pt: theme => `${theme.spacing(2)} !important`
                            }}
                          >
                            <FormControl fullWidth size='small' sx={{ mr: [0, 3], mb: [3, 0] }}>
                              <InputLabel id='user-view-plans-select-label'>Choose Plan</InputLabel>
                              <Select
                                label='Choose Plan'
                                defaultValue={100}
                                id='user-view-plans-select'
                                labelId='user-view-plans-select-label'
                                onChange={e => setPlan(Number(e.target.value))}
                              >
                                <MenuItem value={100}>100 mints - $5</MenuItem>
                                <MenuItem value={1000}>1000 mints - $40</MenuItem>
                              </Select>
                            </FormControl>
                          </DialogContent>
                          <DialogContent
                            sx={{
                              display: 'flex',
                              pb: 8,
                              pl: [6, 15],
                              pr: [6, 15],
                              flexWrap: ['wrap', 'nowrap'],
                              pt: theme => `${theme.spacing(2)} !important`
                            }}
                          >
                            <Button
                              variant='contained'
                              sx={{ minWidth: ['100%', 0], mr: 2, mb: [2, 0] }}
                              startIcon={<CreditCardOutline />}
                              onClick={payment}
                            >
                              Credit Card Payment
                            </Button>
                            <Button
                              onClick={slashPayment}
                              variant='contained'
                              sx={{ minWidth: ['100%', 0] }}
                              startIcon={<Ethereum />}
                            >
                              Crypto Payment
                            </Button>
                          </DialogContent>
                        </Dialog>
                        {/* <Modal
                          open={open}
                          onClose={handleClose}
                          aria-labelledby='modal-modal-title'
                          aria-describedby='modal-modal-description'
                        >
                          <Card sx={style}>
                            <Typography variant='h6' component='h2'>
                              Add Tickets
                            </Typography>
                            <Typography sx={{ mt: 2 }}>100 tickets for $5</Typography>
                            <Button onClick={payment} variant='contained' size='large' sx={{ ml: 4 }}>
                              Checkout
                            </Button>
                          </Card>
                        </Modal> */}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader
                  title='Token List'
                  titleTypographyProps={{
                    sx: { lineHeight: '2rem !important', letterSpacing: '0.15px !important' }
                  }}
                ></CardHeader>
                <CardContent>
                  <Button
                    variant='contained'
                    href={`https://thirdweb.com/goerli/${contractAddress}/nfts`}
                    target={'_blank'}
                  >
                    Edit on Thirdweb
                  </Button>
                  {/* {rows.length ? (
                    <DataGrid autoHeight rows={rows} columns={columns} experimentalFeatures={{ newEditingApi: true }} />
                  ) : (
                    <p>loading</p>
                  )} */}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card>
                <CardHeader
                  title='Customize Gates'
                  titleTypographyProps={{
                    sx: { lineHeight: '2rem !important', letterSpacing: '0.15px !important' }
                  }}
                />
                <CardContent>
                  <FormGroup>
                    <OptionsWrapper sx={{ mb: 1 }}>
                      <InputLabel htmlFor='invoice-add-client-notes' sx={{ cursor: 'pointer', fontSize: '1rem' }}>
                        Twitter Follow Gate
                      </InputLabel>
                      <Switch id='invoice-add-client-notes' disabled />
                    </OptionsWrapper>
                    <OptionsWrapper>
                      <InputLabel htmlFor='invoice-add-payment-stub' sx={{ cursor: 'pointer', fontSize: '1rem' }}>
                        NFT Holder Gate
                      </InputLabel>
                      <Switch id='invoice-add-payment-stub' disabled />
                    </OptionsWrapper>
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      ) : (
        <>Contract Owner can </>
      )}
    </>
  )
}

export default EditionAdmin
