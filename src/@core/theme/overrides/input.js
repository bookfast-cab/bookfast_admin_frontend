const input = theme => {
  
  return {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: theme.palette.text.secondary
        }
      }
    },
    MuiInput: {
      styleOverrides: {
        root: {
          '&:before': {
            borderBottom: `1px solid rgba(${theme.palette.customColors.main}, 0.22)`
          },
          '&:hover:not(.Mui-disabled):before': {
            borderBottom: `1px solid rgba(${theme.palette.customColors.main}, 0.32)`
          },
          '&.Mui-disabled:before': {
            borderBottom: `1px solid ${theme.palette.text.disabled}`
          }
        }
      }
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: `rgba(${theme.palette.customColors.main}, 0.04)`,
          '&:hover:not(.Mui-disabled)': {
            backgroundColor: `rgba(${theme.palette.customColors.main}, 0.08)`
          },
          '&:before': {
            borderBottom: `1px solid rgba(${theme.palette.customColors.main}, 0.22)`
          },
          '&:hover:not(.Mui-disabled):before': {
            borderBottom: `1px solid rgba(${theme.palette.customColors.main}, 0.32)`
          }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(58, 53, 65, 0.32)' // hover border
          },
          '&:hover.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: '#f44336' // error hover border
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(58, 53, 65, 0.22)' // default border
          },
          '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
            borderColor: '#9e9e9e' // disabled border
          }
        },
        input: {
          padding: '8px 5px', // custom input padding
          
        }
      }
    },
   
    
  }
}

export default input
