// ** React Import
import { useRef, useState } from 'react'

// ** MUI Import
import List from '@mui/material/List'
import Box from '@mui/material/Box'
import { styled, useTheme } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'

// ** Third Party Components
import PerfectScrollbar from 'react-perfect-scrollbar'

// ** Component Imports
import Drawer from './Drawer'
import VerticalNavItems from './VerticalNavItems'
import VerticalNavHeader from './VerticalNavHeader'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

const StyledBoxForShadow = styled(Box)({
  display: 'none !important'
})

const Navigation = props => {
  // ** Props
  const {
    hidden,
    afterVerticalNavMenuContent,
    beforeVerticalNavMenuContent,
    verticalNavMenuContent: userVerticalNavMenuContent
  } = props

  // ** States
  const [groupActive, setGroupActive] = useState([])
  const [currentActiveGroup, setCurrentActiveGroup] = useState([])
  const [menuVisible, setMenuVisible] = useState(true) // State for burger icon toggle
  const [menuSearchText, setMenuSearchText] = useState('')

  // filter
  const filteredNavItems = (props.verticalNavItems || []).filter(item => {
    if (!menuSearchText) return true;
    if (item.sectionTitle) return false; // Hide section titles during search
    return item.title && item.title.toLowerCase().includes(menuSearchText.toLowerCase());
  })

  // ** Ref
  const shadowRef = useRef(null)

  // ** Hooks
  const theme = useTheme()

  // ** Fixes Navigation InfiniteScroll
  const handleInfiniteScroll = ref => {
    if (ref) {
      // @ts-ignore
      ref._getBoundingClientRect = ref.getBoundingClientRect
      ref.getBoundingClientRect = () => {
        // @ts-ignore
        const original = ref._getBoundingClientRect()

        return { ...original, height: Math.floor(original.height) }
      }
    }
  }

  // ** Scroll Menu
  const scrollMenu = container => {
    container = hidden ? container.target : container
    if (shadowRef && container.scrollTop > 0) {
      // @ts-ignore
      if (!shadowRef.current.classList.contains('d-block')) {
        // @ts-ignore
        shadowRef.current.classList.add('d-block')
      }
    } else {
      // @ts-ignore
      shadowRef.current.classList.remove('d-block')
    }
  }

  const ScrollWrapper = hidden ? Box : PerfectScrollbar

  return (
    <>
      {/* Burger Icon */}
      {/* <IconButton
        onClick={() => setMenuVisible(!menuVisible)} // Toggle menu visibility
        sx={{ position: 'absolute', top: 10, left: 10, zIndex: 9999 }}
      >
        <MenuIcon />
      </IconButton> */}

      {/* Drawer and Menu */}
      {menuVisible && (
        <Drawer {...props}>
          <VerticalNavHeader {...props} />
          <Box sx={{ pl: 0, pr: 4.5, pb: 1, pt: 5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search Menu"
              value={menuSearchText}
              onChange={(e) => setMenuSearchText(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '0px 50px 50px 0px',
                  paddingRight: '8px'
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderLeft: 'none'
                },
                '& .MuiOutlinedInput-input': {
                  padding: '4.5px 0', // Much slimmer height
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: menuSearchText ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setMenuSearchText('')} edge="end">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
            />
          </Box>
          <StyledBoxForShadow
            ref={shadowRef}
            sx={{
              background: `linear-gradient(${theme.palette.background.default} 40%,${hexToRGBA(
                theme.palette.background.default,
                0.1
              )} 95%,${hexToRGBA(theme.palette.background.default, 0.05)})`
            }}
          />
          <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <ScrollWrapper
              ref={ref => handleInfiniteScroll(ref)}
              {...(hidden
                ? {
                    onScroll: container => scrollMenu(container),
                    sx: { height: '100%', overflowY: 'auto', overflowX: 'hidden' }
                  }
                : {
                    options: { wheelPropagation: false },
                    onScrollY: container => scrollMenu(container)
                  })}
            >
              {beforeVerticalNavMenuContent ? beforeVerticalNavMenuContent(props) : null}
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                {userVerticalNavMenuContent ? (
                  userVerticalNavMenuContent(props)
                ) : (
                  <List className='nav-items' sx={{ transition: 'padding .25s ease', pr: 4.5 }}>
                    <VerticalNavItems
                      groupActive={groupActive}
                      setGroupActive={setGroupActive}
                      currentActiveGroup={currentActiveGroup}
                      setCurrentActiveGroup={setCurrentActiveGroup}
                      {...props}
                      verticalNavItems={filteredNavItems}
                    />
                  </List>
                )}
              </Box>
            </ScrollWrapper>
          </Box>
          {afterVerticalNavMenuContent ? afterVerticalNavMenuContent(props) : null}
        </Drawer>
      )}
    </>
  )
}

export default Navigation
