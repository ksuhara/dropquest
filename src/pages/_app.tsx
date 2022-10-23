/* eslint-disable @typescript-eslint/no-unused-vars */
// ** React Imports
// ** Prismjs Styles
import 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
// ** React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css'
// ** Global css styles
import '../../styles/globals.css'

import type { EmotionCache } from '@emotion/cache'
// ** Emotion Imports
import { CacheProvider } from '@emotion/react'
import { ChainId, ThirdwebProvider } from '@thirdweb-dev/react'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
// ** Next Imports
import Head from 'next/head'
import { Router } from 'next/router'
// ** Loader Import
import NProgress from 'nprogress'
import { ReactNode, useState } from 'react'
// ** Third Party Import
import { Toaster } from 'react-hot-toast'
import AclGuard from 'src/@core/components/auth/AclGuard'
import AuthGuard from 'src/@core/components/auth/AuthGuard'
import GuestGuard from 'src/@core/components/auth/GuestGuard'
// ** Spinner Import
import Spinner from 'src/@core/components/spinner'
import WindowWrapper from 'src/@core/components/window-wrapper'
import { SettingsConsumer, SettingsProvider } from 'src/@core/context/settingsContext'
// ** Styled Components
import ReactHotToast from 'src/@core/styles/libs/react-hot-toast'
import ThemeComponent from 'src/@core/theme/ThemeComponent'
// ** Utils Imports
import { createEmotionCache } from 'src/@core/utils/create-emotion-cache'
// ** Config Imports
import { defaultACLObj } from 'src/configs/acl'
import themeConfig from 'src/configs/themeConfig'
// ** Contexts
import { AuthProvider } from 'src/context/AuthContext'
import ChainContext from 'src/context/Chain'
// ** Component Imports
import UserLayout from 'src/layouts/UserLayout'

// ** Extend App Props with Emotion
type ExtendedAppProps = AppProps & {
  Component: NextPage
  emotionCache: EmotionCache
}

type GuardProps = {
  authGuard: boolean
  guestGuard: boolean
  children: ReactNode
}

const clientSideEmotionCache = createEmotionCache()

// ** Pace Loader
if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start()
  })
  Router.events.on('routeChangeError', () => {
    NProgress.done()
  })
  Router.events.on('routeChangeComplete', () => {
    NProgress.done()
  })
}

const Guard = ({ children, authGuard, guestGuard }: GuardProps) => {
  if (guestGuard) {
    return <GuestGuard fallback={<Spinner />}>{children}</GuestGuard>
  } else if (!guestGuard && !authGuard) {
    return <>{children}</>
  } else {
    return <AuthGuard fallback={<Spinner />}>{children}</AuthGuard>
  }
}

// ** Configure JSS & ClassName
const App = (props: ExtendedAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  const [selectedChain, setSelectedChain] = useState(ChainId.Goerli)

  // Variables
  const getLayout = Component.getLayout ?? (page => <UserLayout>{page}</UserLayout>)

  const setConfig = Component.setConfig ?? undefined

  const authGuard = Component.authGuard ?? true

  const guestGuard = Component.guestGuard ?? false

  const aclAbilities = Component.acl ?? defaultACLObj

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>{`${themeConfig.templateName} - Material Design React Admin Template`}</title>
        <meta
          name='description'
          content={`${themeConfig.templateName} – Material Design React Admin Dashboard Template – is the most developer friendly & highly customizable Admin Dashboard Template based on MUI v5.`}
        />
        <meta name='keywords' content='Material Design, MUI, Admin Template, React Admin Template' />
        <meta name='viewport' content='initial-scale=1, width=device-width' />
      </Head>
      <ChainContext.Provider value={{ selectedChain, setSelectedChain }}>
        <ThirdwebProvider
          desiredChainId={selectedChain}
          sdkOptions={{
            gasless: {
              openzeppelin: {
                relayerUrl: process.env.NEXT_PUBLIC_OPENZEPPELIN_URL || ''
              }
            }
          }}
          authConfig={{
            domain: 'regidrop.vercel.app',
            authUrl: '/api/auth',
            loginRedirect: '/'
          }}
        >
          <AuthProvider>
            <SettingsProvider {...(setConfig ? { pageSettings: setConfig() } : {})}>
              <SettingsConsumer>
                {({ settings }) => {
                  return (
                    <ThemeComponent settings={settings}>
                      <WindowWrapper>
                        {/* <Guard authGuard={authGuard} guestGuard={guestGuard}> */}
                        {/* <AclGuard aclAbilities={aclAbilities} guestGuard={guestGuard}> */}
                        {getLayout(<Component {...pageProps} />)}
                        {/* </AclGuard> */}
                        {/* </Guard> */}
                      </WindowWrapper>
                      <ReactHotToast>
                        <Toaster position={settings.toastPosition} toastOptions={{ className: 'react-hot-toast' }} />
                      </ReactHotToast>
                    </ThemeComponent>
                  )
                }}
              </SettingsConsumer>
            </SettingsProvider>
          </AuthProvider>
        </ThirdwebProvider>
      </ChainContext.Provider>
    </CacheProvider>
  )
}

export default App
