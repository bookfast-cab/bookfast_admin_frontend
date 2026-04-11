import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import VerticalLayout from 'src/@core/layouts/VerticalLayout'
import VerticalNavItems from 'src/navigation/vertical'
import UpgradeToProButton from './components/UpgradeToProButton'
import VerticalAppBarContent from './components/vertical/AppBarContent'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useEffect } from 'react';
import { useRouter } from 'next/router';

import React, { useState } from 'react';
import io from 'socket.io-client';
import { Snackbar, Alert } from '@mui/material';

const UserLayout = ({ children }) => {
  const router = useRouter();

  const [ticketMessage, setTicketMessage] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  useEffect(
    () => {
      const token = localStorage.getItem('access_token');
      if(!token){
        router.push('/pages/login/');
      }
    },
    
    //[]
  );

  const { settings, saveSettings } = useSettings()

  /**
   *  The below variable will hide the current layout menu at given screen size.
   *  The menu will be accessible from the Hamburger icon only (Vertical Overlay Menu).
   *  You can change the screen size from which you want to hide the current layout menu.
   *  Please refer useMediaQuery() hook: https://mui.com/components/use-media-query/,
   *  to know more about what values can be passed to this hook.
   *  ! Do not change this value unless you know what you are doing. It can break the template.
   */
  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'))

  const UpgradeToProImg = () => {
    
    return (
      <Box sx={{ mx: 'auto' }}>
        <a
          target='_blank'
          rel='noreferrer'
          href='https://themeselection.com/products/BookFast-mui-react-nextjs-admin-template/'
        >
          <img width={230} alt='' src='' />
        </a>
      </Box>
    )
  }

  return (
    <>
    <Snackbar
      open={openSnackbar}
      autoHideDuration={6000}
      onClose={handleCloseSnackbar}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={handleCloseSnackbar}
        severity="info"
        sx={{
          width: '100%',
          backgroundColor: '#333', // Dark background color
          color: '#fff',           // Light text color for contrast
          fontWeight: 'bold',      // Bold font to make text stand out
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)', // Adding some shadow for a 3D effect
        }}
      >
        { ticketMessage }
      </Alert>
    </Snackbar>


    <VerticalLayout
      hidden={hidden}
      settings={settings}
      saveSettings={saveSettings}
      verticalNavItems={VerticalNavItems()} // Navigation Items
      afterVerticalNavMenuContent={UpgradeToProImg}
      verticalAppBarContent={(
        props // AppBar Content
      ) => (
        <VerticalAppBarContent
          hidden={hidden}
          settings={settings}
          saveSettings={saveSettings}
          toggleNavVisibility={props.toggleNavVisibility}
        />
      )}
    >
      {children}
      <UpgradeToProButton />
    </VerticalLayout>
    </>
  )
}

export default UserLayout
