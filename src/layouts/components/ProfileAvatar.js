import React, { useState } from 'react';
import { Avatar } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const ProfileAvatar = ({ item }) => {
  // State to track if the image failed to load
  const [imageError, setImageError] = useState(false);

  // Handler for image load error
  const handleError = () => {
    setImageError(true); // Set the error state when the image fails to load
  };

return (
  item ? (
    <Avatar
      src={!imageError ? `https://service.bookfast.in/driverProfilePic/${item.id}.jpg` : ''}
      alt="Profile"
      sx={{ width: 35, height: 35, marginTop: '5px' }}
      onError={handleError}
    >
      {imageError && <AccountCircleIcon sx={{ fontSize: 35, color: 'grey' }} />}
    </Avatar>
  ) : (
    <Avatar sx={{ width: 35, height: 35, marginTop: '5px' }}>
      <AccountCircleIcon sx={{ fontSize: 35, color: 'grey' }} />
    </Avatar>
  )
);

};

export default ProfileAvatar;
