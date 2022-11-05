/* eslint-disable @typescript-eslint/no-unused-vars */
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import DateTimePicker from '@mui/lab/DateTimePicker'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import { useMediaQuery, useTheme } from '@mui/material'
import Autocomplete from '@mui/material/Autocomplete'
import Box, { BoxProps } from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormGroup from '@mui/material/FormGroup'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DataGrid, GridColumns, GridRowsProp } from '@mui/x-data-grid'
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api'
import { useContract, useNFTs } from '@thirdweb-dev/react'
import { ApexOptions } from 'apexcharts'
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore'
import CreditCardOutline from 'mdi-material-ui/CreditCardOutline'
import Delete from 'mdi-material-ui/Delete'
import DotsVertical from 'mdi-material-ui/DotsVertical'
import Ethereum from 'mdi-material-ui/Ethereum'
import Plus from 'mdi-material-ui/Plus'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import ReactApexcharts from 'src/@core/components/react-apexcharts'
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import { filterValidKeys } from 'src/@core/utils/key'
import { Key } from 'src/@core/utils/types'
import initializeFirebaseClient from 'src/configs/initFirebase'
import ChainContext from 'src/context/Chain'
import useFirebaseUser from 'src/hooks/useFirebaseUser'
import usePlacesAutocomplete, { getDetails, getGeocode, getLatLng } from 'use-places-autocomplete'

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['admin'])),
      locale
    }
  }
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: true
  }
}

interface AdminProps {
  locale: string
}

const EditionAdmin = ({ locale }: AdminProps) => {
  const router = useRouter()
  const { t } = useTranslation()
  const { contractAddress, chain } = router.query
  const { user, isLoading: loadingAuth } = useFirebaseUser()
  const { db } = initializeFirebaseClient()
  const theme = useTheme()
  const { selectedChain, setSelectedChain } = useContext(ChainContext)
  const contractQuery = useContract(contractAddress as string)
  const { data: nfts, isLoading } = useNFTs(contractQuery.contract)

  const [contractData, setContractData] = useState<any>()
  const [keys, setKeys] = useState<Key[]>([])
  const [rows, setRows] = useState<GridRowsProp>([])
  const [plan, setPlan] = useState(100)

  const [startPicker, setStartPicker] = useState<Date | null>(new Date())
  const date = new Date()
  const [endPicker, setEndPicker] = useState<Date | null>(new Date(date.setMonth(date.getMonth() + 1)))
  const [isTwitterIdChanged, setIsTwitterIdChanged] = useState(false)
  const [adminEditData, setAdminEditData] = useState({
    twitterGate: { twitterId: '', isActive: false },
    nftGate: { contractAddress: '', chainId: 'ethereum', isActive: false },
    location: { name: '', latLng: { lat: 35.66, lng: 139.71 }, isActive: false },
    visibility: { isPublic: false }
  })

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLEMAPS_API_KEY || '',
    libraries: ['places']
  })

  const handleChanges = (e: any) => {
    console.log(e.target)
    if (e.target.name == 'twitterGate-twitterId') {
      setIsTwitterIdChanged(true)
    }
    const splitted = e.target.name.split('-')
    if (splitted[1] == 'isActive' || splitted[1] == 'isPublic') {
      setAdminEditData((prevState: any) => ({
        ...prevState,
        [splitted[0]]: {
          ...prevState[splitted[0]],
          [splitted[1]]: e.target.checked
        }
      }))
    } else {
      setAdminEditData((prevState: any) => ({
        ...prevState,
        [splitted[0]]: {
          ...prevState[splitted[0]],
          [splitted[1]]: e.target.value
        }
      }))
    }
  }

  const saveGate = async () => {
    const docRef = doc(db, `chain/${chain}/contracts`, contractAddress as string)

    let twitter
    if (isTwitterIdChanged) {
      twitter = await verifyTwitterGate()
      setIsTwitterIdChanged(false)
    }

    updateDoc(docRef, {
      nftGate: adminEditData.nftGate,
      twitterGate: twitter ? twitter : adminEditData.twitterGate,
      location: adminEditData.location,
      visibility: {
        isPublic: adminEditData.visibility.isPublic,
        startTime: startPicker,
        endTime: endPicker
      }
    })
      .then(() => {
        toast.success('successfully saved!')
      })
      .catch(err => {
        toast.error(err.message)
      })
  }

  const verifyTwitterGate = async () => {
    const userReq = await fetch(`/api/fetch-twitter-user`, {
      method: 'POST',
      body: JSON.stringify({
        screenName: adminEditData.twitterGate.twitterId
      })
    }).catch((e: any) => {
      toast.error(e.message)
    })
    if (!userReq) return
    const userResult = await userReq.json()
    console.log(userResult)
    const result = {
      ...adminEditData.twitterGate,
      id: userResult.id,
      name: userResult.name,
      picture: userResult.profile_image_url
    }

    return result
  }

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

  const payment = async () => {
    const response = await fetch(`/api/stripe-checkout`, {
      method: 'POST',
      body: JSON.stringify({
        contractAddress,
        plan,
        chain
      })
    })
      .then(data => data.json())
      .catch(err => {
        toast.error(err.message)
      })
    if (response.customer_id) {
      window.localStorage.setItem('customer_id', response.customer_id)
    }
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

  const nameToChainId: any = {
    goerli: 5,
    mumbai: 80001
  }

  const matches: boolean = useMediaQuery('(min-width:577px)')
  const {
    ready,
    value,
    setValue: setMapName,
    suggestions: { status, data },
    clearSuggestions
  } = usePlacesAutocomplete()

  const containerStyle = {
    width: matches ? '40rem' : '20rem',
    height: matches ? '300px' : '200px'
  }

  useEffect(() => {
    console.log(isLoaded, 'isLoaded')
    setSelectedChain(nameToChainId[chain as string])

    const syncData = async () => {
      if (!contractAddress) return
      const docRef = doc(db, `chain/${chain}/contracts`, contractAddress as string)
      const docResult = await getDoc(docRef)
      const docData = await docResult.data()
      setContractData(docData)
      setAdminEditData({
        twitterGate: docData?.twitterGate,
        nftGate: docData?.nftGate,
        location: docData?.location,
        visibility: docData?.visibility
      })
      setStartPicker(docData?.visibility?.startTime?.toDate())
      setEndPicker(docData?.visibility?.endTime?.toDate())
      const querySnapshot = await getDocs(collection(db, `chain/${chain}/contracts/${contractAddress}/keys`))
      const arr: any = []
      querySnapshot.forEach(doc => {
        arr.push({ ...doc.data(), key: doc.id })
      })
      setKeys(arr)
    }
    syncData()
  }, [contractAddress, db, chain])

  useEffect(() => {
    console.log(selectedChain)
    const syncNfts = async () => {
      const newRows = nfts?.map(nft => {
        return {
          id: nft.metadata.id,
          supply: nft.supply,
          name: nft.metadata.name,
          image: nft.metadata.image
        }
      })
      if (!newRows) return
      setRows(newRows)
    }
    syncNfts()
  }, [nfts, selectedChain])

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleMapSelect = async (address: any) => {
    setMapName(address, false)
    clearSuggestions()
    const geocode = await getGeocode({ address })
    const { lat, lng } = await getLatLng(geocode[0])
    setAdminEditData((prevState: any) => ({
      ...prevState,
      location: {
        name: value,
        latLng: { lat, lng }
      }
    }))
  }

  return (
    <>
      {contractData && user?.uid == contractData.owner ? (
        <>
          <Grid container justifyContent='space-between' sx={{ my: 4 }}>
            <Grid item>
              <Typography variant='h2'>{contractData.name}</Typography>
              <Grid container sx={{ marginTop: 2, alignItems: 'center' }}>
                <Typography variant='subtitle1'>{contractAddress}</Typography>
                <Chip label={`${chain}`} size={'medium'} sx={{ ml: 2 }} />
              </Grid>
            </Grid>
            <Grid item sx={{ mr: 4, my: 4 }}>
              <Button
                href={`/${locale}/contract/${chain}/${contractAddress}/qr`}
                variant='contained'
                size='large'
                disabled={filterValidKeys(keys).length == 0}
              >
                {/* {t('admin:qrcode_button')} */}
                QRコード
              </Button>
              <IconButton onClick={handleClick}>
                <DotsVertical />
              </IconButton>
              <Menu anchorEl={anchorEl} onClose={handleMenuClose} open={Boolean(anchorEl)}>
                <MenuItem>
                  <Delete />
                  Delete
                </MenuItem>
              </Menu>
            </Grid>
          </Grid>
          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
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
                    <Grid item xs={12} sm={4} sx={{ mb: [3, 0] }}>
                      <ReactApexcharts
                        type='donut'
                        height={120}
                        series={[keys.length - filterValidKeys(keys).length, filterValidKeys(keys).length]}
                        options={options}
                      />
                    </Grid>
                    <Grid item xs={12} sm={8} sx={{ my: 'auto' }}>
                      <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant='body2'>Number of Tickets</Typography>
                          <Typography variant='h6'>
                            {filterValidKeys(keys).length}/{keys.length}
                          </Typography>
                        </Box>
                        <Button
                          onClick={handleOpen}
                          variant='contained'
                          size='large'
                          sx={{ ml: 4 }}
                          startIcon={<Plus />}
                        >
                          {/* {t('admin:buy_ticket')} */}
                          ミントチケットを購入する
                        </Button>
                        <Dialog
                          open={open}
                          onClose={handleClose}
                          aria-labelledby='user-view-plans'
                          aria-describedby='user-view-plans-description'
                          sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 650, pt: 8, pb: 8 } }}
                        >
                          <DialogTitle id='user-view-plans' sx={{ textAlign: 'center', fontSize: '1.5rem !important' }}>
                            {/* {t('admin:ticket_modal_title')} */}
                            ミントチケットを追加
                          </DialogTitle>

                          <DialogContent>
                            <DialogContentText
                              variant='body2'
                              sx={{ textAlign: 'center' }}
                              id='user-view-plans-description'
                            >
                              {/* {t('admin:ticket_modal_description')} */}
                              NFTミントチケットを購入することで、顧客がミントできるNFTの数を増やすことができます!ガス代はOmiyage
                              NFTで負担しているのでご了承ください
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
                                <MenuItem value={500}>500 mints - $20</MenuItem>
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
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={5}>
              <Card>
                <CardHeader
                  title='Release Setting'
                  titleTypographyProps={{
                    sx: { lineHeight: '2rem !important', letterSpacing: '0.15px !important' }
                  }}
                />
                <CardContent>
                  <Stack spacing={4}>
                    <Box>
                      <FormControlLabel
                        control={
                          <Switch
                            size='medium'
                            checked={adminEditData.visibility?.isPublic}
                            onChange={handleChanges}
                            name='visibility-isPublic'
                          />
                        }
                        labelPlacement='start'
                        label='Make it public?'
                      />
                    </Box>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateTimePicker
                        label='Start Time'
                        value={startPicker}
                        onChange={newValue => setStartPicker(newValue)}
                        renderInput={params => <TextField {...params} />}
                      />
                    </LocalizationProvider>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateTimePicker
                        label='End Time'
                        value={endPicker}
                        onChange={setEndPicker}
                        renderInput={params => <TextField {...params} />}
                      />
                    </LocalizationProvider>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={10}>
              <Card>
                <CardHeader title='Location'></CardHeader>
                <CardContent>
                  {isLoaded ? (
                    <>
                      <Typography marginBottom={2}>
                        {/* {t('admin:location_description')} */}
                        リアルイベントや店舗の場合、場所を設定できます。
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            size='medium'
                            checked={adminEditData.location?.isActive}
                            onChange={handleChanges}
                            name='location-isActive'
                          />
                        }
                        labelPlacement='start'
                        label='Real Event?'
                      />
                      <Autocomplete
                        sx={{ width: 350, mb: 2 }}
                        options={data}
                        id='autocomplete-outlined'
                        getOptionLabel={option => option.description}
                        renderInput={params => (
                          <TextField {...params} label='Search Place' onChange={e => setMapName(e.target.value)} />
                        )}
                        disabled={!ready}
                        onSelect={(e: any) => handleMapSelect(e.target.value)}
                      />

                      <GoogleMap
                        zoom={13}
                        center={
                          adminEditData?.location?.latLng ? adminEditData?.location.latLng : { lat: 35.66, lng: 139.71 }
                        }
                        mapContainerStyle={containerStyle}
                        options={{ disableDefaultUI: true }}
                      >
                        {adminEditData?.location?.latLng ? (
                          <Marker position={adminEditData?.location.latLng}></Marker>
                        ) : (
                          <></>
                        )}
                      </GoogleMap>
                    </>
                  ) : (
                    <>loading...</>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={10}>
              <Card>
                <CardHeader
                  title='Customize Conditions'
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
                      <Switch
                        checked={adminEditData.twitterGate?.isActive}
                        onChange={handleChanges}
                        name='twitterGate-isActive'
                      />
                    </OptionsWrapper>
                    <Box sx={{ mb: 8 }}>
                      <Typography marginBottom={2}>
                        {/* {t('admin:twittergate_description')} */}
                        指定した Twitter ユーザーをフォローすることを、ミント条件に設定する
                      </Typography>
                      <TextField
                        value={adminEditData.twitterGate?.twitterId}
                        onChange={handleChanges}
                        name='twitterGate-twitterId'
                        label='Twitter ID'
                        InputProps={{
                          startAdornment: <InputAdornment position='start'>@</InputAdornment>
                        }}
                        sx={{ mr: 4 }}
                      />
                    </Box>
                    <OptionsWrapper>
                      <InputLabel htmlFor='invoice-add-payment-stub' sx={{ cursor: 'pointer' }}>
                        NFT Holder Gate
                      </InputLabel>
                      <Switch
                        checked={adminEditData.nftGate?.isActive}
                        onChange={handleChanges}
                        name='nftGate-isActive'
                      />
                    </OptionsWrapper>
                    <Box>
                      <Typography marginBottom={2}>
                        {/* {t('admin:nftgate_description')} */}
                        指定された NFT を保持することをミント条件に設定します。
                      </Typography>
                      <TextField
                        value={adminEditData.nftGate?.contractAddress}
                        onChange={handleChanges}
                        name='nftGate-contractAddress'
                        label='ContractAddress'
                        sx={{ mr: 4, width: 300 }}
                      />
                      <Select
                        value={adminEditData.nftGate?.chainId}
                        onChange={handleChanges}
                        defaultValue={'ethereum'}
                        label='Chain'
                        name='nftGate-chainId'
                        sx={{ mr: 4 }}
                      >
                        <MenuItem value={'ethereum'} id='aaaa-chainId'>
                          Ethereum
                        </MenuItem>
                        <MenuItem value={'polygon'}>Polygon</MenuItem>
                        <MenuItem value={'avalanche'}>Avalanche</MenuItem>
                      </Select>
                    </Box>
                  </FormGroup>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={10}>
              <Button fullWidth variant='contained' onClick={saveGate}>
                save
              </Button>
            </Grid>

            <Grid item xs={12} md={10}>
              <Card>
                <CardHeader
                  title='Token List'
                  titleTypographyProps={{
                    sx: { lineHeight: '2rem !important', letterSpacing: '0.15px !important' }
                  }}
                ></CardHeader>
                <CardContent>
                  <Typography marginBottom={2}>
                    {/* {t('admin:tokenlist_description')} */}
                    詳細なトークン設定はthirdweb ダッシュボードで編集してください
                  </Typography>
                  <Button
                    variant='contained'
                    href={`https://thirdweb.com/${chain}/${contractAddress}/nfts`}
                    target={'_blank'}
                  >
                    Edit on Thirdweb
                  </Button>
                  {rows.length ? (
                    <DataGrid autoHeight rows={rows} columns={columns} experimentalFeatures={{ newEditingApi: true }} />
                  ) : (
                    <>{isLoading ? <p>loading</p> : <></>}</>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      ) : (
        <>
          <CircularProgress />
        </>
      )}
    </>
  )
}

export default EditionAdmin
