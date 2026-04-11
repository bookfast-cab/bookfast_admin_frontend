const GlobalStyles = theme => {
  
  return {
    '.ps__rail-y': {
      zIndex: 1,
      right: '0 !important',
      left: 'auto !important',
      '&:hover, &:focus, &.ps--clicking': {
        backgroundColor: theme.palette.mode === 'light' ? '#E4E5EB !important' : '#423D5D !important'
      },
      '& .ps__thumb-y': {
        right: '3px !important',
        left: 'auto !important',
        backgroundColor: theme.palette.mode === 'light' ? '#C2C4D1 !important' : '#504B6D !important'
      },
      '.layout-vertical-nav &': {
        '& .ps__thumb-y': {
          width: 4,
          backgroundColor: theme.palette.mode === 'light' ? '#C2C4D1 !important' : '#504B6D !important'
        },
        '&:hover, &:focus, &.ps--clicking': {
          backgroundColor: 'transparent !important',
          '& .ps__thumb-y': {
            width: 6
          }
        }
      }
    },
    '#nprogress': {
      pointerEvents: 'none',
      '& .bar': {
        left: 0,
        top: 0,
        height: 3,
        width: '100%',
        zIndex: 2000,
        position: 'fixed',
        backgroundColor: theme.palette.primary.main
      }
    },

    // MuiTableCell-root MuiTableCell-body MuiTableCell-sizeMedium css-1wpl2sj-MuiTableCell-root
    '.MuiTableCell-body, .MuiTypography-subtitle2': {
      color: 'black !important', // Custom text color
    },

    '.MuiTableCell-head, .MuiTypography-caption' : {
      color: 'black !important', // Custom text color
      fontSize : '15px !important',
      fontWeight : 'bold !important'
    },

    '.MuiTypography-body1' : {
      color: 'black !important',
    }
   
    // MuiButtonBase-root MuiListItemButton-root MuiListItemButton-gutters MuiListItemButton-root MuiListItemButton-gutters css-13uwcjx-MuiButtonBase-root-MuiListItemButton-root

  }
}

export default GlobalStyles
