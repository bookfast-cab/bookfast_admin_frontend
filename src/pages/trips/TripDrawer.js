// components/TripDrawer.js
import React, { useEffect, useMemo, useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Avatar,
  Divider,
  Stack,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Paper,
  Chip
} from '@mui/material';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ToastMessage from 'src/components/ToastMessage';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

// BookFast brand colors - soft and professional
const BRAND_COLORS = {
  primary: '#2563eb',      // BookFast blue
  primaryLight: '#dbeafe', // Light blue background
  secondary: '#64748b',    // Soft gray
  success: '#10b981',      // Soft green
  warning: '#f59e0b',      // Soft orange
  error: '#ef4444',        // Soft red
  info: '#06b6d4',         // Soft cyan
  background: '#f8fafc',   // Very light gray
  paper: '#ffffff',        // White
  textPrimary: '#1e293b',  // Dark gray
  textSecondary: '#64748b', // Medium gray
  border: '#e2e8f0',       // Light border
  accent: '#8b5cf6',       // Soft purple
};

const getStatusLabel = (status) => {
  switch (status) {
    case 0: return { label: 'New Trip', color: BRAND_COLORS.primary };
    case 1: return { label: 'Accepted', color: BRAND_COLORS.info };
    case 3: return { label: 'Started', color: BRAND_COLORS.warning };
    case 4: return { label: 'Completed', color: BRAND_COLORS.success };
    case 5: return { label: 'Cancelled', color: BRAND_COLORS.error };
    case 6: return { label: 'Scheduled', color: BRAND_COLORS.accent };
    case 7: return { label: 'On the Way', color: BRAND_COLORS.info };
    case 8: return { label: 'Arrived', color: BRAND_COLORS.warning };
    case 9: return { label: 'Missed', color: BRAND_COLORS.secondary };
    default: return { label: 'Unknown', color: BRAND_COLORS.secondary };
  }
};

const InfoRow = ({ label, value, highlight = false }) => (
  <Grid container spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
    <Grid item xs={5}>
      <Typography
        variant="body2"
        fontWeight={600}
        color={BRAND_COLORS.textSecondary}
        sx={{ whiteSpace: 'nowrap' }}
      >
        {label}:
      </Typography>
    </Grid>
    <Grid item xs={7}>
      <Typography
        variant="body2"
        color={highlight ? BRAND_COLORS.primary : BRAND_COLORS.textPrimary}
        fontWeight={highlight ? 600 : 400}
        sx={{ wordBreak: 'break-word' }}
      >
        {value ?? '—'}
      </Typography>
    </Grid>
  </Grid>
);

const TripDrawer = ({ open, onClose, data = {}, vehicleList = [] }) => {
  const customer = data?.customer || {};
  const fullName = `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim();
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const [bgColor, setBgColor] = useState(BRAND_COLORS.primaryLight);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [singleDriver, setSingleDriver] = useState({});
  const [showAssignPanel, setShowAssignPanel] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success');

  const { label: statusLabel, color: statusColor } = getStatusLabel(data?.status);




  const searchSingleDriver = async (searchPhone) => {
    const queryParams = new URLSearchParams({
      phone: searchPhone
    }).toString();

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/searchSingleDriver?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const { driver, membership, lastTrip } = data.data;
          setSingleDriver({ driver, membership, lastTrip });
          setErrorMessage('');
        } else {
          setSingleDriver({});
          setErrorMessage('Driver not found');
        }
      }).catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (searchText.length > 8) {
      searchSingleDriver(searchText);
    }
  }, [searchText]);

  const handleCancelClick = () => setCancelDialogOpen(true);

  const AssignDriverToTrip = (driver) => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/assignTripToDriver`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      },
      body: JSON.stringify({
        driverId: driver.id,
        tripId: data.id
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setToastMessage("Driver assigned successfully!");
          setToastSeverity("success");
          setToastOpen(true);
          onClose(true);
          setSingleDriver({});
          setSearchText("");
        } else {
          setToastMessage("Driver not found!");
          setToastSeverity("error");
          setToastOpen(true);
          setSingleDriver({});
          setErrorMessage("Driver not found");
        }
      })
      .catch((err) => {
        console.error(err);
        setToastMessage("Something went wrong!");
        setToastSeverity("error");
        setToastOpen(true);
      });
  };

  const handleClose = () => {
    setReason('');
    setCancelDialogOpen(false);
  };

  const initials = fullName
    ? fullName.split(' ').map(word => word[0]).join('')
    : customer.phone_number?.slice(-4) ?? 'CU';

  const tripTypeMap = {
    1: "Local",
    2: "Rental",
    3: "Outstation",
  };

  const tripSubTypeMap = {
    1: "Oneway Trip",
    2: "Round Trip",
  };

  const getAvatarColors = () => {
    const avatarColors = [
      { bg: '#dbeafe', color: '#1e40af' }, // Blue
      { bg: '#dcfce7', color: '#16a34a' }, // Green
      { bg: '#fef3c7', color: '#d97706' }, // Orange
      { bg: '#ede9fe', color: '#7c3aed' }, // Purple
      { bg: '#fce7f3', color: '#be185d' }, // Pink
      { bg: '#e0f2fe', color: '#0369a1' }, // Cyan
    ];

    return avatarColors[Math.floor(Math.random() * avatarColors.length)];
  };

  useEffect(() => {
    if (open) {
      setBgColor(getAvatarColors());
    }
  }, [open]);

  const handleSubmit = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/cancelTrip`, {
      method: 'PUT',   // use PUT if you're updating/cancelling
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      },
      body: JSON.stringify({
        tripId: data.id,
        reason: reason
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setToastMessage("Trip cancelled successfully!");
          setToastSeverity("success");
          setToastOpen(true);
          onClose(true);
          handleClose();
        } else {
          setToastMessage(data.message || "Trip cancellation failed!");
          setToastSeverity("error");
          setToastOpen(true);
        }
      })
      .catch((err) => {
        console.error(err);
        setToastMessage("Something went wrong!");
        setToastSeverity("error");
        setToastOpen(true);

      });

  };

  const handleAssignClick = () => {
    setShowAssignPanel(true);
  };

  const payment = data?.paymentDetail || {};

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: 750,
            backgroundColor: BRAND_COLORS.background,
          }
        }}
      >
        <Box sx={{ p: 3, position: 'relative', height: '100%', overflowY: 'auto' }}>
          {/* Close Button */}
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: BRAND_COLORS.paper,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: BRAND_COLORS.primaryLight,
              }
            }}
          >
            <CloseIcon />
          </IconButton>

          {data ? (
            <>
              {/* Customer Header */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  backgroundColor: BRAND_COLORS.paper,
                  border: `1px solid ${BRAND_COLORS.border}`,
                  borderRadius: 2
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: bgColor.bg,
                      color: bgColor.color,
                      fontWeight: 700,
                      fontSize: '1.2rem'
                    }}
                  >
                    {initials}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      color={BRAND_COLORS.textPrimary}
                    >
                      {fullName || 'Customer'}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={BRAND_COLORS.textSecondary}
                    >
                      {customer.phone_number}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mb: 3 }}>
                {[0, 6, 9].includes(data.status) && (
                  <Button
                    variant="contained"
                    size="medium"
                    startIcon={<PersonAddIcon />}
                    onClick={handleAssignClick}
                    sx={{
                      backgroundColor: BRAND_COLORS.primary,
                      '&:hover': {
                        backgroundColor: '#1d4ed8',
                      },
                      boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
                    }}
                  >
                    Assign Driver
                  </Button>
                )}

                {data.status !== 4 && data.status !== 5 && (
                  <Button
                    variant="outlined"
                    size="medium"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelClick}
                    sx={{
                      borderColor: BRAND_COLORS.error,
                      color: BRAND_COLORS.error,
                      '&:hover': {
                        borderColor: '#dc2626',
                        backgroundColor: '#fef2f2',
                      },
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </Box>

              {/* Assign Driver Panel */}
              {showAssignPanel && (
                <Paper
                  elevation={1}
                  sx={{
                    mb: 3,
                    p: 3,
                    backgroundColor: BRAND_COLORS.paper,
                    border: `1px solid ${BRAND_COLORS.border}`,
                    borderRadius: 2,
                    position: 'relative',
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6" fontWeight={600} color={BRAND_COLORS.textPrimary}>
                      Assign Driver
                    </Typography>
                    <IconButton
                      onClick={() => setShowAssignPanel(false)}
                      size="small"
                      sx={{
                        backgroundColor: BRAND_COLORS.background,
                        '&:hover': {
                          backgroundColor: BRAND_COLORS.primaryLight,
                        }
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>

                  <TextField
                    fullWidth
                    label="Search by mobile number"
                    variant="outlined"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: BRAND_COLORS.primary,
                        },
                      },
                    }}
                  />

                  {errorMessage && (
                    <Typography variant="body2" color={BRAND_COLORS.error} sx={{ mb: 2 }}>
                      {errorMessage}
                    </Typography>
                  )}

                  {singleDriver.driver && (
                    <Paper
                      elevation={0}
                      sx={{
                        border: `1px solid ${BRAND_COLORS.border}`,
                        borderRadius: 1
                      }}
                    >
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar
                                  src={singleDriver.driver.profilePic}
                                  alt={singleDriver.driver.driverName}
                                  sx={{ width: 40, height: 40 }}
                                />
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  color={BRAND_COLORS.textPrimary}
                                >
                                  {singleDriver.driver.driverName}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell />
                          </TableRow>

                          <TableRow>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600} color={BRAND_COLORS.textSecondary}>
                                Phone
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color={BRAND_COLORS.textPrimary}>
                                {singleDriver.driver.phone_number || 'N/A'}
                              </Typography>
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600} color={BRAND_COLORS.textSecondary}>
                                Wallet Balance
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color={BRAND_COLORS.textPrimary}>
                                ₹{singleDriver.driver.walletBalance ?? '0.00'}
                              </Typography>
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600} color={BRAND_COLORS.textSecondary}>
                                Membership
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={singleDriver.membership
                                  ? singleDriver.membership.isExpired ? 'Expired' : 'Active'
                                  : 'N/A'}
                                size="small"
                                color={singleDriver.membership?.isExpired ? 'error' : 'success'}
                                variant="outlined"
                              />
                            </TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell colSpan={2} align="right">
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => AssignDriverToTrip(singleDriver.driver)}
                                sx={{
                                  backgroundColor: BRAND_COLORS.primary,
                                  '&:hover': {
                                    backgroundColor: '#1d4ed8',
                                  },
                                }}
                              >
                                Assign Driver
                              </Button>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </Paper>
                  )}
                </Paper>
              )}

              {/* Trip Details Header */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  backgroundColor: BRAND_COLORS.paper,
                  border: `1px solid ${BRAND_COLORS.border}`,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" fontWeight={600} color={BRAND_COLORS.textPrimary} mb={2}>
                  Trip Details
                </Typography>

                {/* Date Information */}
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarMonthIcon sx={{ color: BRAND_COLORS.primary, fontSize: 20 }} />
                      <Typography variant="body2" fontWeight={600} color={BRAND_COLORS.textSecondary}>
                        Created:
                      </Typography>
                      <Typography variant="body2" color={BRAND_COLORS.textPrimary}>
                        {new Date(data.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarMonthIcon sx={{ color: BRAND_COLORS.warning, fontSize: 20 }} />
                      <Typography variant="body2" fontWeight={600} color={BRAND_COLORS.textSecondary}>
                        Pickup:
                      </Typography>
                      <Typography variant="body2" color={BRAND_COLORS.textPrimary}>
                        {new Date(data.pickup_date).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Trip Information */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  backgroundColor: BRAND_COLORS.paper,
                  border: `1px solid ${BRAND_COLORS.border}`,
                  borderRadius: 2,
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        p: 2,
                        backgroundColor: BRAND_COLORS.background,
                        borderRadius: 1,
                        border: `1px solid ${BRAND_COLORS.border}`,
                      }}
                    >
                      <Typography variant="body1" fontWeight={600} color={BRAND_COLORS.textPrimary}>
                        Trip ID: {data.trip_id}
                      </Typography>
                      <Chip
                        label={statusLabel}
                        sx={{
                          backgroundColor: statusColor,
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Stack>

                    {/* Show cancelled info only if trip is cancelled */}
                    {data.status === 5 && (
                      <Stack
                        direction="column"
                        spacing={1}
                        sx={{
                          mt: 2,
                          p: 2,
                          backgroundColor: "#fff3f3",
                          borderRadius: 1,
                          border: `1px solid ${BRAND_COLORS.border}`,
                        }}
                      >
                        <Typography variant="body2" color="error" fontWeight={600}>
                          Cancelled Reason: {data.cancelledReason || "N/A"}
                        </Typography>
                        <Typography variant="body2" color="error">
                          Cancelled By: {data.cancelledBy || "N/A"}
                        </Typography>
                      </Stack>
                    )}
                  </Grid>


                  {/* Address Information */}
                  <Grid item xs={12}>
                    <InfoRow label="Pickup Address" value={data.pickup_address} />
                    <InfoRow label="Drop Address" value={data.drop_address} />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoRow
                      label="OTP"
                      value={data.otp ? data.otp : "—"}
                      highlight={true}
                    />
                  </Grid>

                  {/* Trip Details Grid */}
                  <Grid item xs={6}>
                    <InfoRow label="Distance" value={`${data.distance} km`} />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoRow
                      label="Trip Type"
                      value={tripTypeMap[data.trip_type] || "N/A"}
                      highlight={true}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoRow
                      label="Sub Type"
                      value={tripSubTypeMap[data.trip_sub_type] || "N/A"}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoRow
                      label="Vehicle Type"
                      value={vehicleList.find(v => v.id === data.vehicle_type)?.vehicle_type || 'N/A'}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoRow label="Payment Method" value={data.payment_method} />
                  </Grid>
                  <Grid item xs={6}>
                    <InfoRow label="Scheduled" value={data.isScheduled ? 'Yes' : 'No'} />
                  </Grid>
                  

                </Grid>
              </Paper>


              {/* Pricing Information */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  backgroundColor: BRAND_COLORS.paper,
                  border: `1px solid ${BRAND_COLORS.border}`,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" fontWeight={600} color={BRAND_COLORS.textPrimary} mb={2}>
                  Pricing Details
                </Typography>

                <Box>
                  <InfoRow label="Base Fare" value={`₹${payment.base_fare || 0}`} />
                  <InfoRow label="Additional Fare" value={`₹${payment.additional_fare || 0}`} />
                  <InfoRow label="Driver Allowance" value={`₹${payment.driver_allowance || 0}`} />
                  <InfoRow label="Tax" value={`₹${payment.tax || 0}`} />
                  <InfoRow label="Toll Tax" value={payment.toll_tax ? `₹${payment.toll_tax}` : '—'} />

                  {payment.discount > 0 && (
                    <InfoRow label="Promo Code" value={payment.promo_code || 'N/A'} />
                  )}

                  <Divider sx={{ my: 2 }} />

                  {console.log("payment.paymentDetail",payment)}

                  <InfoRow label="Price Per KM" value={`₹${payment.price_per_km || 0}`} />
                  <InfoRow label="Estimated KM" value={`${payment.km || 0} km`} />
                  <InfoRow label="Traveled KM" value={`${payment.actual_distance || 0} km`} />
                  <InfoRow label="Extra KM Charge" value={`₹${payment.extra_km_charge || 0}`} />
                  <InfoRow label="Extra KM" value={`${payment.extra_km || 0} km`} />
                  <InfoRow label="Extra Hours" value={`${payment.extra_hours || 0} hours`} />
                  <InfoRow label="Extra Hours Charge" value={`₹${payment.extra_hour_charge || 0}`} />
                  <InfoRow label="Waiting Charge" value={`₹${payment.waiting_charge || 0}`} />
                  
                  <InfoRow label="Extra Time Charge" value={`₹${payment.extra_time_charge || 0}`} />
                  <InfoRow label="Tip" value={`₹${payment.tip || 0}`} />
                  <InfoRow
                    label="GST"
                    value={`${payment.gst?.title || 'GST'} (₹${payment.gst?.amount || 0})`}
                  />

                  <Divider sx={{ my: 2 }} />
                  <InfoRow label="Sub total" value={`₹${payment?.sub_total || 0}`} />
                  <InfoRow label="Discount" value={`₹${payment.discount || 0}`} />

                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: BRAND_COLORS.primaryLight,
                      borderRadius: 1,
                      textAlign: 'center',
                      mt: 2
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color={BRAND_COLORS.primary}
                    >
                      Total Fare: ₹{payment.total_fare || 0}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Driver Information */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: BRAND_COLORS.paper,
                  border: `1px solid ${BRAND_COLORS.border}`,
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" fontWeight={600} color={BRAND_COLORS.textPrimary} mb={2}>
                  Driver Information
                </Typography>

                {data.driver ? (
                  <Box>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar
                        src={data.driver.profilePic}
                        alt={data.driver.driverName}
                        sx={{ width: 48, height: 48 }}
                      />
                      <Box>
                        <Typography variant="body1" fontWeight={600} color={BRAND_COLORS.textPrimary}>
                          {data.driver.driverName}
                        </Typography>
                        <Typography variant="body2" color={BRAND_COLORS.textSecondary}>
                          {data.driver.phone_number}
                        </Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <InfoRow label="Driver ID" value={data.driver_id} />
                      </Grid>
                      <Grid item xs={6}>
                        {console.log("data is ", data)}
                        <InfoRow
                          label="Earning"
                          value={data.driver_earning == null ? '—' : `₹${data.driver_earning}`}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <InfoRow
                          label="Cash Collection"
                          value={data.cash_collection !== 'null' ? `₹${data.cash_collection}` : '—'}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  <Typography variant="body2" color={BRAND_COLORS.textSecondary} textAlign="center" py={2}>
                    No driver assigned yet
                  </Typography>
                )}
              </Paper>

              {/* Cancel Dialog */}
              <Dialog
                open={cancelDialogOpen}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    width: '400px',
                    borderRadius: 2,
                  }
                }}
              >
                <DialogTitle sx={{ color: BRAND_COLORS.textPrimary }}>
                  Cancel Trip
                </DialogTitle>
                <DialogContent>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Enter cancellation reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    autoFocus
                    sx={{ mt: 1 }}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleClose} color="inherit">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={!reason.trim()}
                    sx={{
                      backgroundColor: BRAND_COLORS.error,
                      '&:hover': {
                        backgroundColor: '#dc2626',
                      },
                    }}
                  >
                    Submit
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          ) : (
            <Box mt={10} textAlign="center">
              <Typography variant="h6" color={BRAND_COLORS.textSecondary}>
                Loading trip details...
              </Typography>
            </Box>
          )}
        </Box>
      </Drawer>

      <ToastMessage
        open={toastOpen}
        message={toastMessage}
        severity={toastSeverity}
        onClose={() => setToastOpen(false)}
      />
    </>
  );
};

export default TripDrawer;