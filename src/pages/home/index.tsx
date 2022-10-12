// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import { useAddress } from '@thirdweb-dev/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

import { collection, query, where, getDocs } from 'firebase/firestore'
import initializeFirebaseClient from 'src/configs/initFirebase'
import useFirebaseDocument from 'src/hooks/useFirebaseUserDocument'
import { ConsoleNetworkOutline } from 'mdi-material-ui'

const Home = () => {
  const address = useAddress()
  const [nftAddress, setNFTAddress] = useState('')
  const registerNFT = async () => {
    await fetch(`/api/register-nft-contract`, {
      method: 'POST',
      body: JSON.stringify({
        nftAddress,
        address
      })
    })
  }

  const { contractsDocument } = useFirebaseDocument()
  console.log(contractsDocument, 'contractsDocument')

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Kick start your project 🚀'></CardHeader>
          <CardContent>
            <Typography sx={{ mb: 2 }}>Add contract address</Typography>
            <TextField label='ContractAddress' onChange={e => setNFTAddress(e.target.value)} />
            <Button onClick={registerNFT} variant='contained' size='large'>
              Register NFT
            </Button>
          </CardContent>
        </Card>
      </Grid>
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
