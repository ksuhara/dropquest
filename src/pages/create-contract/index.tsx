// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import { useAddress, useMetamask, useSDK } from '@thirdweb-dev/react'
import TextField from '@mui/material/TextField'

import DropzoneWrapper from 'src/@core/styles/libs/react-dropzone'
import FileUploaderSingle from 'src/views/forms/form-elements/file-uploader/FileUploaderSingle'
import { useState } from 'react'
import Alert from '@mui/material/Alert'
import useBgColor from 'src/@core/hooks/useBgColor'
import LoadingButton from '@mui/lab/LoadingButton'
import { useRouter } from 'next/router'

const CreateContractPage = () => {
  const address = useAddress()
  const connectWithMetamask = useMetamask()
  const sdk = useSDK()
  const bgClasses = useBgColor()
  const [imageURL, setImageURL] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const deployContract = async () => {
    setLoading(true)
    if (!sdk || !address) return

    const contractMetadata = {
      name,
      description,
      seller_fee_basis_points: 0,
      fee_recipient: '0x6a84E19A4801E5F003ea9d3202a38AE6a864DfdC',
      primary_sale_recipient: '0x6a84E19A4801E5F003ea9d3202a38AE6a864DfdC',
      image: imageURL
    }

    console.log(111)
    const contractAddress = await sdk.deployer.deployBuiltInContract('edition', contractMetadata)
    console.log(contractAddress)
    const edition = await sdk.getContract(contractAddress, 'edition')

    const tokenMetadata = {
      supply: 0,
      metadata: {
        name,
        image: imageURL
      }
    }
    await edition.roles.grant('minter', '0x6a84E19A4801E5F003ea9d3202a38AE6a864DfdC')
    await edition.erc1155.mintTo(address, tokenMetadata)
    await fetch(`/api/register-nft-contract`, {
      method: 'POST',
      body: JSON.stringify({
        nftAddress: contractAddress,
        address
      })
    })
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
                You can create your own NFT contract without paying gas.
              </Typography>
              <Typography variant='caption' sx={{ display: 'block', color: 'primary.main' }}>
                The contract is Thridweb's contract, so you can edit in Thirdweb's dashboard.
              </Typography>
            </Alert>
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
              <Grid container spacing={6} className='match-height'>
                <Grid item xs={12}>
                  <FileUploaderSingle setImageURL={setImageURL} />
                </Grid>
              </Grid>
            </DropzoneWrapper>
            <p>{imageURL}</p>

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
    </Grid>
  )
}

export default CreateContractPage
