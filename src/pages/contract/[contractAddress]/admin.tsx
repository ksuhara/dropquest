import Button from '@mui/material/Button'
import { useAddress } from '@thirdweb-dev/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useFirebaseUser from 'src/hooks/useFirebaseUser'
import { getDoc, doc } from 'firebase/firestore'
import initializeFirebaseClient from 'src/configs/initFirebase'
import Typography from '@mui/material/Typography'
import { AnyAaaaRecord } from 'dns'
import { ConsoleLine } from 'mdi-material-ui'

const ContractAdmin = () => {
  const router = useRouter()
  const { contractAddress } = router.query
  const { user, isLoading: loadingAuth } = useFirebaseUser()
  const { db } = initializeFirebaseClient()

  interface Key {
    key: string
    isUsed: boolean
  }

  const [contractData, setContractData] = useState<any>()
  const [keys, setKeys] = useState<Key[]>([])

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
      setKeys(testData!.keys)
    }
    syncData()
  }, [contractAddress])

  return (
    <>
      {contractData && user?.uid == contractData.owner ? (
        <>
          <h1>{contractData.name}</h1>
          <h3>{contractAddress}</h3>
          <Button onClick={payment} variant='contained' size='large'>
            購入
          </Button>
          {keys.map(key => {
            return (
              <Typography key={key.key} fontSize={'3px'}>
                {key.key}
              </Typography>
            )
          })}
          <Button href={`/contract/${contractAddress}/qr`} variant='contained' size='large'>
            qrコード一覧表示
          </Button>
        </>
      ) : (
        <>Contract Owner can </>
      )}
    </>
  )
}

export default ContractAdmin
