// ** MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import useFirebaseDocument from 'src/hooks/useFirebaseUserDocument'

const Home = () => {
  // const address = useAddress()

  const { contractsDocument } = useFirebaseDocument()
  console.log(contractsDocument, 'contractsDocument')

  return (
    <Grid container spacing={6}>
      {/* <Grid item xs={12}>
        <Card>
          <CardHeader title='Kick start your project 🚀'></CardHeader>
          <CardContent>
            <Typography sx={{ mb: 2 }}>
              Register your contract to this dashboard. The contract must be "SignatureDrop" or "Edition" of Thirdweb.
            </Typography>
            <TextField label='ContractAddress' onChange={e => setNFTAddress(e.target.value)} sx={{ width: 360 }} />
            <Button onClick={registerNFT} variant='contained' size='large' sx={{ ml: 4 }}>
              Register NFT
            </Button>
          </CardContent>
        </Card>
      </Grid> */}
      {contractsDocument?.map(contract => {
        return (
          <Grid item xs={12} key={contract.contractAddress}>
            <Link href={`/contract/${contract.contractAddress}/admin`}>
              <Card>
                <CardHeader title={contract.name}></CardHeader>
                <CardContent>
                  <Typography sx={{ mb: 2 }}>{contract.contractAddress}</Typography>
                  <Typography>
                    Please read our Authentication and ACL Documentations to get more out of them.
                  </Typography>
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
