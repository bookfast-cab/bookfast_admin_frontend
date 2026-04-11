// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

const Pagination = theme => {
  return {
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          // Styling the selected pagination item
          '&.Mui-selected:not(.Mui-disabled):not(.MuiPaginationItem-textPrimary):not(.MuiPaginationItem-textSecondary):hover': {
            backgroundColor: `rgba(${theme.palette.customColors.main}, 0.12)`,
            transition: 'background-color 0.3s ease-in-out', // Smooth transition
            borderRadius: '50%', // Circular effect for items
          },
          // Add a border radius for smooth rounded corners
          borderRadius: '4px',
          // Default transition for hover
          transition: 'background-color 0.3s ease, transform 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)', // Slight scale effect on hover for interaction
            backgroundColor: `rgba(${theme.palette.customColors.main}, 0.15)`,
          }
        },
        outlined: {
          borderColor: `rgba(${theme.palette.customColors.main}, 0.22)`,
          borderWidth: '1px',
          '&:hover': {
            borderColor: `rgba(${theme.palette.customColors.main}, 0.5)`, // Darker border on hover
            backgroundColor: `rgba(${theme.palette.customColors.main}, 0.05)`,
            transition: 'border-color 0.3s ease, background-color 0.3s ease', // Smooth transition
          },
        },
        outlinedPrimary: {
          '&.Mui-selected': {
            backgroundColor: hexToRGBA(theme.palette.primary.main, 0.12),
            '&:hover': {
              backgroundColor: `${hexToRGBA(theme.palette.primary.main, 0.2)} !important`,
              borderColor: `${hexToRGBA(theme.palette.primary.main, 0.5)}`,
            },
            transition: 'background-color 0.3s ease, border-color 0.3s ease', // Smooth transition
          },
        },
        outlinedSecondary: {
          '&.Mui-selected': {
            backgroundColor: hexToRGBA(theme.palette.secondary.main, 0.12),
            '&:hover': {
              backgroundColor: `${hexToRGBA(theme.palette.secondary.main, 0.2)} !important`,
              borderColor: `${hexToRGBA(theme.palette.secondary.main, 0.5)}`,
            },
            transition: 'background-color 0.3s ease, border-color 0.3s ease', // Smooth transition
          },
        }
      }
    }
  }
}

export default Pagination
