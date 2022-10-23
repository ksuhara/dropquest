// ** React Imports
import { useEffect } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** Spinner Import
import Spinner from 'src/@core/components/spinner'

// ** Hook Imports
import useFirebaseUser from 'src/hooks/useFirebaseUser'

/**
 *  Set Home URL based on User Roles
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getHomeRoute = (role: string) => {
  return '/home'
}

const Home = () => {
  // ** Hooks
  const { user, isLoading } = useFirebaseUser()
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    if (user) {
      // Redirect user to Home URL
      router.replace('/home')
    } else if (!isLoading) {
      router.replace('/login')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  return <Spinner />
}

export default Home
