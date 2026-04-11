const UserIcon = props => {
  // ** Props
  const { icon, iconProps ,styles={}} = props
  const IconTag = icon


  /* styles = {
      color: 'red',
      fontSize: '2rem'
    } */
  // @ts-ignore
  
  return <IconTag {...iconProps} style={{ ...styles }} />
}

export default UserIcon
