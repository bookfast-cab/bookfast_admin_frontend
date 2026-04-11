// ** MUI Imports
import CssBaseline from '@mui/material/CssBaseline'
import GlobalStyles from '@mui/material/GlobalStyles'
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles'

// ** Theme Config
import themeConfig from 'src/configs/themeConfig'

// ** Theme Override Imports
import overrides from './overrides'
import typography from './typography'

// ** Theme
import themeOptions from './ThemeOptions'

// ** Global Styles
import GlobalStyling from './globalStyles'

const ThemeComponent = props => {
  // ** Props
  const { settings, children } = props

  // ** Merged ThemeOptions of Core and User
  const coreThemeConfig = themeOptions(settings)

  // ** Pass ThemeOptions to CreateTheme Function to create partial theme without component overrides
  let theme = createTheme(coreThemeConfig)

  // ** Continue theme creation and pass merged component overrides to CreateTheme function
  theme = createTheme(theme, {
    components: {
      ...overrides(theme),
      // MuiButton: {
      //   styleOverrides: {
      //     root: {
      //       lineHeight: '10px', // Correct the property name from "line-height" to "lineHeight"
      //       fontSize: '0.675rem',
      //     },
      //   },
      // },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding:"5px", // Optional: Default padding right
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            fontSize: '12px',
            '& .MuiInputBase-root': {
             
              borderRadius: 5,
            },
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            padding: '0px 4px',
            fontSize: '12px',
            color: '#6c757d',
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            padding: '2px 8px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(0, 0, 0, 0.23)',
            },
            '&:hover:not(.Mui-disabled):not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(0, 0, 0, 0.5)',
            }
          },
          input: {
            padding: '10px 12px' // Reduce input padding here,
          }
        }
      }
      
    },
    typography: {
      ...typography(theme),
      h1: {
        fontSize: '1.2rem',
        fontWeight: 700,
        lineHeight: 1.4,
        letterSpacing: '-0.5px', // Add letter spacing for h1
        color: '#333', // Make it more stylish by changing color
      },
      h2: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.35,
        letterSpacing: '-0.2px', // Add letter spacing for h2
        color: '#444', // Stylish color for h2
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
        color: '#555',
        fontFamily: "'Roboto', sans-serif", // You can change the font family if needed
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
        color: '#666',
        fontFamily: "'Roboto', sans-serif",
      },
      subtitle1: {
        fontSize: '1.25rem',
        fontWeight: 500,
        lineHeight: 1.45,
        color: '#777',
        fontFamily: "'Roboto', sans-serif",
      },
      // You can customize other typography types like h3, h4, etc.
    },
  });

  // ** Set responsive font sizes to true
  if (themeConfig.responsiveFontSizes) {
    theme = responsiveFontSizes(theme)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={() => GlobalStyling(theme)} />
      {children}
    </ThemeProvider>
  )
}

export default ThemeComponent
