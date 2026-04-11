// ** MUI Imports
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import useMediaQuery from '@mui/material/useMediaQuery'
import InputAdornment from '@mui/material/InputAdornment'

// ** Icons Imports
import Menu from 'mdi-material-ui/Menu'
import Magnify from 'mdi-material-ui/Magnify'

// ** Components
import ModeToggler from 'src/@core/layouts/components/shared-components/ModeToggler'
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'
import NotificationDropdown from 'src/@core/layouts/components/shared-components/NotificationDropdown'
import { useEffect, useState } from 'react'; // Import useState
import VolumeOff from 'mdi-material-ui/VolumeOff'
import VolumeUp from 'mdi-material-ui/VolumeHigh'

const AppBarContent = props => {
  // ** Props
  const { hidden, settings, saveSettings, toggleNavVisibility } = props

  // ** Hook
  const hiddenSm = useMediaQuery(theme => theme.breakpoints.down('sm'))

  // ** State for sound icon
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);

  const handleSoundToggle = () => {
    if (!isSoundEnabled) {
      setIsSoundEnabled(true)
    }
  }

  // ** Enable sound when user clicks anywhere on the page
  useEffect(() => {
    const enableSoundOnClick = () => {
      if (!isSoundEnabled) {
        setIsSoundEnabled(true)
      }
    }

    document.addEventListener('click', enableSoundOnClick)

    return () => {
      document.removeEventListener('click', enableSoundOnClick)
    }
  }, [isSoundEnabled])

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        {hidden ? (
          <IconButton
            color='inherit'
            onClick={toggleNavVisibility}
            sx={{ ml: -2.75, ...(hiddenSm ? {} : { mr: 3.5 }) }}
          >
            <Menu />
          </IconButton>
        ) : null}
        <></>
      </Box>
      <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
        {true ? null : (
          <Box
            component='a'
            target='_blank'
            rel='noreferrer'
            sx={{ mr: 4, display: 'flex' }}
            href='https://github.com/themeselection/BookFast-mui-react-nextjs-admin-template-free'
          >
            <img
              height={24}
              alt='github stars'
              src='https://img.shields.io/github/stars/themeselection/BookFast-mui-react-nextjs-admin-template-free?style=social'
            />
          </Box>
        )}
        
        {/* <IconButton
          onClick={handleSoundToggle}
          disabled={isSoundEnabled} 
          sx={{
            color: 'red', 
            '&.Mui-disabled': {
              color: 'red',
            }
          }}
        >
          {isSoundEnabled ? <VolumeUp /> : <VolumeOff />}
        </IconButton> */}


        <NotificationDropdown />
        <UserDropdown />
      </Box>
    </Box>
  )
}

export default AppBarContent
