// ** MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import useFirebaseUser from 'src/hooks/useFirebaseUser'
import useFirebaseDocument from 'src/hooks/useFirebaseUserDocument'

const Home = () => {
  // const address = useAddress()
  const { contractsDocument } = useFirebaseDocument()
  // ** Hooks
  const { user, isLoading } = useFirebaseUser()
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    if (!user && !isLoading) {
      router.replace('/login?returnUrl=home')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

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

  return (
    <Grid container spacing={6}>
      {contractsDocument?.length ? (
        <></>
      ) : (
        <Grid item xs={12}>
          <Card>
            <CardHeader title='Kick start your project 🚀'></CardHeader>
            <CardContent>
              <Typography sx={{ mb: 2 }}>
                Register your contract to this dashboard. The contract must be "SignatureDrop" or "Edition" of Thirdweb.
              </Typography>
              <Button href='/create-contract' variant='contained' size='large' sx={{ ml: 4 }}>
                Register NFT
              </Button>
            </CardContent>
          </Card>
        </Grid>
      )}

      {contractsDocument?.map(contract => {
        return (
          <Grid item xs={12} key={contract.contractAddress}>
            <Link href={`/contract/${contract.chain}/${contract.contractAddress}/admin`}>
              <Card>
                <Grid container>
                  <Grid item xs={3} md={2}>
                    <Img src={contract.image} alt='img'></Img>
                  </Grid>
                  <Grid item xs={9} md={10}>
                    <CardHeader title={contract.name} action={<Chip label={`${contract.chain}`} />}></CardHeader>
                    <CardContent>
                      <Typography noWrap>{contract.contractAddress}</Typography>
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
  )
}

export default Home
