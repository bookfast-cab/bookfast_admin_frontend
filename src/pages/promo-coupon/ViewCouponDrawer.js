import {
    Drawer,
    Box,
    Typography,
    Grid,
    Chip,
    Divider,
    Button
  } from '@mui/material';
  import { useEffect, useState } from 'react';
  
  const ViewCouponDrawer = ({ open, onClose, initialData }) => {
    const [couponData, setCouponData] = useState({});
  
    const formatDateOnly = (isoDate) => isoDate ? isoDate.split('T')[0] : '';
  
    useEffect(() => {
      if (initialData) {
        setCouponData({
          ...initialData,
          valid_from: formatDateOnly(initialData.valid_from),
          valid_to: formatDateOnly(initialData.valid_to),
          mobileNumbers: initialData.customers?.map(c => c.mobile_number) || []
        });
      }
    }, [initialData]);
  
    const displayRow = (label, value) => (
      <Grid item xs={12}>
        <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
        <Typography variant="body1">{value || '-'}</Typography>
        <Divider sx={{ my: 1 }} />
      </Grid>
    );
  
    return (
      <Drawer anchor="right" open={open} onClose={() => onClose(false)}>
        <Box sx={{ width: 500, p: 3 }}>
          <Typography variant="h6" gutterBottom>View Coupon</Typography>
          <Grid container spacing={2}>
            {displayRow('Coupon Code', couponData.code)}
            {displayRow('Discount Type', couponData.discount_type)}
            {displayRow('Discount Value', couponData.discount_value)}
            {displayRow('Min Ride Amount', couponData.min_ride_amount)}
            {displayRow('Max Discount', couponData.max_discount)}
            {displayRow('Valid From', couponData.valid_from)}
            {displayRow('Valid To', couponData.valid_to)}
            {displayRow('Usage Limit', couponData.limit)}
  
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Mobile Numbers</Typography>
              {couponData.mobileNumbers?.length > 0 ? (
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {couponData.mobileNumbers.map((num, index) => (
                    <Chip key={index} label={num} />
                  ))}
                </Box>
              ) : (
                <Typography variant="body1">-</Typography>
              )}
              <Divider sx={{ my: 2 }} />
            </Grid>
  
            <Grid item xs={12}>
              <Button variant="contained" onClick={() => onClose(false)}>Close</Button>
            </Grid>
          </Grid>
        </Box>
      </Drawer>
    );
  };
  
  export default ViewCouponDrawer;
  