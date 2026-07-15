// ** React Imports
import { useState, Fragment } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import Menu from '@mui/material/Menu'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

// ** Icons Imports
import CogOutline from 'mdi-material-ui/CogOutline'
import CurrencyUsd from 'mdi-material-ui/CurrencyUsd'
import EmailOutline from 'mdi-material-ui/EmailOutline'
import LogoutVariant from 'mdi-material-ui/LogoutVariant'
import AccountOutline from 'mdi-material-ui/AccountOutline'
import MessageOutline from 'mdi-material-ui/MessageOutline'
import HelpCircleOutline from 'mdi-material-ui/HelpCircleOutline'
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import {
  Button,
  TextField,
} from "@mui/material";

// ** Styled Components
const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
}))

const UserDropdown = () => {
  // ** States
  const [anchorEl, setAnchorEl] = useState(null)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleOpenPasswordModal = () => {
    setNewPassword("");
    setconfirmPassword("");
    setOpenPasswordModal(true);
  };

const handleChangePassword = async () => {
  try {

    if(!newPassword){
      setErrorMessage("New Password is required.");
      return;
    }
    
    if(!confirmPassword){
      setErrorMessage("Confirm Password is required.");
      return;
    }
    
    if(newPassword != confirmPassword){
      setErrorMessage("Passwords do not match.");
      return;
    }

    let token;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('access_token');
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/change-admin-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
      }
    );

    const result = await response.json();
    if (result.success) {
      setSuccessMessage("Password changed successfully!");
      setOpenPasswordModal(false);
    } else {
      setErrorMessage(result.message || "Failed to update password.");
    }
  } catch (err) {
    console.log(err)
    setErrorMessage("An error occurred.");
  }
};



  const handleCloseSnackbar = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };


  // ** Hooks
  const router = useRouter()

  const handleDropdownOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = url => {
    if (url) {
      router.push(url)
    }
    setAnchorEl(null)
  }
   const handleSubmit = async () => {

    let token;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('access_token');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/admin-logout`, {
      method: 'GET',
      headers: {
        Authorization: `${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    const data = await response.json()    
    
    if (data.success) {
      localStorage.clear();
      router.push('/pages/login')
    } else {
      setErrorMessage(data.message)
    }
  }

  const styles = {
    py: 2,
    px: 4,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    color: 'text.primary',
    textDecoration: 'none',
    '& svg': {
      fontSize: '1.375rem',
      color: 'text.secondary'
    }
  }

  return (
    <Fragment>
      <Badge
        overlap='circular'
        onClick={handleDropdownOpen}
        sx={{ ml: 2, cursor: 'pointer' }}
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Avatar
          alt='Admin'
          onClick={handleDropdownOpen}
          sx={{ width: 40, height: 40 }}
          src='/images/avatars/1.png'
        />
      </Badge>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => handleDropdownClose()}
        sx={{ '& .MuiMenu-paper': { width: 230, marginTop: 4 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ pt: 2, pb: 3, px: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              overlap='circular'
              badgeContent={<BadgeContentSpan />}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Avatar alt='Admin' src='/images/avatars/1.png' sx={{ width: '2.5rem', height: '2.5rem' }} />
            </Badge>
            <Box sx={{ display: 'flex', marginLeft: 3, alignItems: 'flex-start', flexDirection: 'column' }}>
              <Typography sx={{ fontWeight: 600 }}>Admin</Typography>
              <Typography variant='body2' sx={{ fontSize: '0.8rem', color: 'text.disabled' }}>
                Admin
              </Typography>
            </Box>
          </Box>
        </Box>
        <Divider sx={{ mt: 0, mb: 1 }} />
        <MenuItem sx={{ p: 0 }} onClick={() => handleOpenPasswordModal()}>
          <Box sx={styles}>
            <AccountOutline sx={{ marginRight: 2 }} />
            Change Password
          </Box>
        </MenuItem>
        
        <Divider />
        <MenuItem sx={{ py: 2 }} onClick={() => handleSubmit()}>
          <LogoutVariant sx={{ marginRight: 2, fontSize: '1.375rem', color: 'text.secondary' }} />
          Logout
        </MenuItem>
      </Menu>


 <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert elevation={6} variant="filled" severity="error">
          {errorMessage}
        </MuiAlert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert elevation={6} variant="filled" severity="success">
          {successMessage}
        </MuiAlert>
      </Snackbar>

        <Dialog open={openPasswordModal} onClose={() => setOpenPasswordModal(false)} fullWidth maxWidth="xs">
            <DialogTitle>Change Password</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                margin="dense"
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Confirm Password"
                type="text"
                value={confirmPassword}
                onChange={(e) => setconfirmPassword(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenPasswordModal(false)}>Cancel</Button>
              <Button onClick={handleChangePassword} variant="contained" color="primary">
                Change Password
              </Button>
            </DialogActions>
          </Dialog>
    
    
    </Fragment>
  )
}

export default UserDropdown
