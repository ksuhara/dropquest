// ** MUI Imports
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import useFirebaseUser from 'src/hooks/useFirebaseUser'
import useFirebaseDocument from 'src/hooks/useFirebaseUserDocument'

const Home = () => {
  // const address = useAddress()

  const { contractsDocument } = useFirebaseDocument()
  console.log(contractsDocument, 'contractsDocument')
  // ** Hooks
  const { user, isLoading } = useFirebaseUser()
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    if (!user && !isLoading) {
      router.replace('/login')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

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
            <Link href={`/contract/${contract.contractAddress}/admin`}>
              <Card>
                <CardHeader title={contract.name}></CardHeader>
                <CardContent>
                  <Typography sx={{ mb: 2 }}>{contract.contractAddress}</Typography>
                  <Typography noWrap>{contract.description}</Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        )
      })}
    </Grid>
  )
}

export default Home
