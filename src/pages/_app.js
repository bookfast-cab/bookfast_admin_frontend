// ** Next Imports
import Head from 'next/head'
import { Router } from 'next/router'

// ** Loader Import
import NProgress from 'nprogress'

// ** Emotion Imports
import { CacheProvider } from '@emotion/react'

// ** Config Imports
import themeConfig from 'src/configs/themeConfig'

// ** Component Imports
import UserLayout from 'src/layouts/UserLayout'
import ThemeComponent from 'src/@core/theme/ThemeComponent'

// ** Contexts
import { SettingsConsumer, SettingsProvider } from 'src/@core/context/settingsContext'

// ** Utils Imports
import { createEmotionCache } from 'src/@core/utils/create-emotion-cache'

// ** React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css'
import getFingerprint from 'src/utils/Fingerprint';

// ** Global css styles
import '../../styles/globals.css'
import { listenForMessages, requestPermission } from 'src/utils/NotificationPermission'
import { useEffect } from 'react'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/router';
import { SocketProvider } from 'src/contexts/SocketContext'

import '../styles/tiptap-editor.css'; // ✅ Global CSS import

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

// ** Configure JSS & ClassName
const App = props => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props
  const router = useRouter();

  // Variables
  const getLayout = Component.getLayout ?? (page => <UserLayout>{page}</UserLayout>)

 useEffect(() => {
    requestPermission();
    listenForMessages();
  }, []);

  
  if (typeof window !== 'undefined') {
    const originalFetch = window.fetch;
    window.fetch = async (url, options = {}) => {
      const device_id = await getFingerprint()
      options.headers = {
        'Content-Type': 'application/json',
        'x-device-id': device_id,
        ...options.headers,
      };

      const response = await originalFetch(url, options);
      if (response.status === 401) {
        localStorage.clear();
        router.push('/pages/login');
        
        return response;
      }

      return response;
    };
  }

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>{`${themeConfig.templateName} - Admin`}</title>
        <meta
          name='description'
          content={`${themeConfig.templateName} – Admin Dashboard.`}
        />
        <meta name='keywords' content='Admin Dashboard' />
        <meta name='viewport' content='initial-scale=1, width=device-width' />
      </Head>
      <SocketProvider> 
      <SettingsProvider>
        <SettingsConsumer>
          {({ settings }) => {
            return <ThemeComponent settings={settings}>{getLayout(<Component {...pageProps} />)}</ThemeComponent>
          }}
        </SettingsConsumer>
      </SettingsProvider>
      </SocketProvider>
      <ToastContainer position="top-right" autoClose={6000} />
    </CacheProvider>
  )
}

export default App
