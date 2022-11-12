// ** MUI Imports
import LoadingButton from '@mui/lab/LoadingButton'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Step from '@mui/material/Step'
import StepContent from '@mui/material/StepContent'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { ChainId, useAddress, useMetamask, useNetwork, useNetworkMismatch, useSDK } from '@thirdweb-dev/react'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import useBgColor from 'src/@core/hooks/useBgColor'
import DropzoneWrapper from 'src/@core/styles/libs/react-dropzone'
import StepperWrapper from 'src/@core/styles/mui/stepper'
import ChainContext from 'src/context/Chain'
import useFirebaseUser from 'src/hooks/useFirebaseUser'
import FileUploaderSingle from 'src/views/forms/form-elements/file-uploader/FileUploaderSingle'
import StepperCustomDot from 'src/views/forms/form-wizard/StepperCustomDot'

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['create', 'common']))
    }
  }
}

const CreateContractPage = () => {
  const { selectedChain, setSelectedChain } = useContext(ChainContext)
  const address = useAddress()
  const connectWithMetamask = useMetamask()
  const sdk = useSDK()
  const bgClasses = useBgColor()
  const [imageURL, setImageURL] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)

  const { user, isLoading } = useFirebaseUser()

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const [activeStep, setActiveStep] = useState<number>(0)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const isMismatch = useNetworkMismatch()
  const [, switchNetwork] = useNetwork()

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    if (!user && !isLoading) {
      router.replace('/login?returnUrl=create-contract')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  const steps = [
    {
      title: t('create:step1_title'),
      description: t('create:step1_description')
    },
    {
      title: t('create:step2_title'),
      description: t('create:step2_description')
    },
    {
      title: t('create:step3_title'),
      description: t('create:step3_description')
    }
  ]

  const chainToName: any = {
    '5': 'goerli',
    '80001': 'mumbai',
    '137': 'polygon'
  }

  const chainToMinter: any = {
    '137': '0xB6Ac3Fe610d1A4af359FE8078d4c350AB95E812b',
    '80001': '0x6a84E19A4801E5F003ea9d3202a38AE6a864DfdC'
  }

  const deployContract = async () => {
    setLoading(true)
    handleClickOpen()
    if (!sdk || !address) return
    if (isMismatch) {
      switchNetwork && switchNetwork(selectedChain)
    }

    const idToken = await user?.getIdToken()

    const contractMetadata = {
      name,
      description,
      seller_fee_basis_points: 0,
      fee_recipient: '0x6a84E19A4801E5F003ea9d3202a38AE6a864DfdC',
      primary_sale_recipient: '0x6a84E19A4801E5F003ea9d3202a38AE6a864DfdC',
      image: imageURL
    }

    const contractAddress = await sdk.deployer.deployBuiltInContract('edition', contractMetadata).catch(e => {
      toast.error(`${e.message}`)
      setLoading(false)
      handleClose()

      return
    })

    if (!contractAddress) return
    await fetch(`/api/register-nft-contract`, {
      method: 'POST',
      body: JSON.stringify({
        nftAddress: contractAddress,
        address,
        chain: chainToName[String(selectedChain)]
      }),
      headers: {
        Authorization: idToken || 'unauthenticated'
      }
    })
    setActiveStep(1)
    const edition = await sdk.getContract(contractAddress, 'edition')

    const tokenMetadata = {
      supply: 0,
      metadata: {
        name,
        image: imageURL
      }
    }
    await edition.roles.grant('minter', chainToMinter[selectedChain])
    setActiveStep(2)
    await edition.erc1155.mintTo(address, tokenMetadata)
    setActiveStep(3)

    setLoading(false)
    router.replace('/home')
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={8} mx='auto'>
        <Card>
          <CardHeader title='Create Contract 🙌'></CardHeader>
          <CardContent>
            <Alert icon={false} sx={{ py: 3, mb: 6, ...bgClasses.primaryLight, '& .MuiAlert-message': { p: 0 } }}>
              <Typography variant='caption' sx={{ display: 'block', color: 'primary.main' }}>
                {t('create:can_create_description')}
              </Typography>
              <Typography variant='caption' sx={{ display: 'block', color: 'primary.main' }}>
                {t('create:can_edit_description')}
              </Typography>
            </Alert>
            <FormControl fullWidth>
              <InputLabel>Chain</InputLabel>
              <Select
                label='Chain'
                value={String(selectedChain)}
                onChange={e => setSelectedChain(parseInt(e.target.value))}
              >
                {/* <MenuItem value={String(ChainId.Polygon)}>Polygon</MenuItem> */}
                <MenuItem value={String(ChainId.Mumbai)}>Mumbai</MenuItem>
              </Select>
            </FormControl>
            <TextField onChange={e => setName(e.target.value)} label='Name' fullWidth sx={{ my: 2 }} />
            <TextField
              onChange={e => setDescription(e.target.value)}
              rows={3}
              multiline
              label='Description'
              fullWidth
              sx={{ my: 2 }}
            />
            <DropzoneWrapper sx={{ my: 2 }}>
              <Grid container spacing={6} sx={{ height: '100%' }}>
                <Grid item xs={12}>
                  <FileUploaderSingle setImageURL={setImageURL} />
                </Grid>
              </Grid>
            </DropzoneWrapper>

            {address ? (
              <LoadingButton
                loading={loading}
                onClick={deployContract}
                variant='contained'
                size='large'
                fullWidth
                sx={{ my: 2 }}
              >
                Deploy
              </LoadingButton>
            ) : (
              <Button onClick={connectWithMetamask} variant='contained' size='large' fullWidth sx={{ my: 2 }}>
                Connect wallet
              </Button>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{'Deploy Contract Steps'}</DialogTitle>
        <DialogContent>
          <Card>
            <CardContent>
              <StepperWrapper>
                <Stepper activeStep={activeStep} orientation='vertical'>
                  {steps.map((step, index) => {
                    return (
                      <Step key={index} className={clsx({ active: activeStep === index })}>
                        <StepLabel StepIconComponent={StepperCustomDot}>
                          <div className='step-label'>
                            <Typography className='step-number'>0{index + 1}</Typography>
                            <div>
                              <Typography className='step-title'>{step.title}</Typography>
                            </div>
                          </div>
                        </StepLabel>
                        <StepContent>
                          <Typography>{step.description}</Typography>
                          <div className='button-wrapper'>
                            <CircularProgress />
                          </div>
                        </StepContent>
                      </Step>
                    )
                  })}
                </Stepper>
              </StepperWrapper>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </Grid>
  )
}

export default CreateContractPage
