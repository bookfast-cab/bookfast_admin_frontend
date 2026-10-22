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
import { SosProvider } from 'src/contexts/SosContext'

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

  
  if (typeof window !== 'undefined' && !window.__fetchIntercepted) {
    window.__fetchIntercepted = true;
    const originalFetch = window.fetch;
    window.fetch = async (url, options = {}) => {
      const device_id = await getFingerprint();
      const existingHeaders = options.headers || {};
      
      const newHeaders = {
        'x-device-id': device_id,
        ...(existingHeaders instanceof Headers ? Object.fromEntries(existingHeaders.entries()) : existingHeaders)
      };

      if (!(options.body instanceof FormData) && !newHeaders['Content-Type']) {
        newHeaders['Content-Type'] = 'application/json';
      }

      options.headers = newHeaders;

      const response = await originalFetch(url, options);
      if (response.status === 401) {
        // Only redirect if not already on the login page
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/pages/login')) {
          console.warn('⚠️ 401 Unauthorized received on', url, '- session expired or logged in from another device.');
          const deviceId = localStorage.getItem('admin_device_id');
          localStorage.clear();
          if (deviceId) {
            localStorage.setItem('admin_device_id', deviceId);
          }
          router.push('/pages/login');
        }
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
        <SosProvider>
          <SettingsProvider>
            <SettingsConsumer>
              {({ settings }) => {
                return <ThemeComponent settings={settings}>{getLayout(<Component {...pageProps} />)}</ThemeComponent>
              }}
            </SettingsConsumer>
          </SettingsProvider>
        </SosProvider>
      </SocketProvider>
      <ToastContainer position="top-right" autoClose={6000} />
    </CacheProvider>
  )
}

export default App
