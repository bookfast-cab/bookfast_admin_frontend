import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import axios from 'axios';
import { toast } from 'react-toastify';

const emptyThreshold = {
  baseFare: '',
  perKm: '',
  perHourCharge: '',
  kmLimit: '',
  extraKm: '',
  extraHours: '',
};

const RoundTripManagement = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [vehicleList, setVehicleList] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [thresholds, setThresholds] = useState({
    threshold1: { ...emptyThreshold },
    threshold2: { ...emptyThreshold },
    threshold3: { ...emptyThreshold },
  });

  const resetThresholds = () => {
    setThresholds({
      threshold1: { ...emptyThreshold },
      threshold2: { ...emptyThreshold },
      threshold3: { ...emptyThreshold },
    });
  };

  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('access_token')
      : null;

  useEffect(() => {
    if (!token) return;
    fetchVehicleList();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (vehicleList.length > 0 && !selectedVehicle) return;
    fetchConfiguration();
  }, [token, selectedVehicle, vehicleList.length]);

  const fetchVehicleList = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/outstation-packageConfig`,
        {
          headers: { Authorization: token },
        }
      );

      const list =
        res.data?.data?.vehicleList ||
        res.data?.vehicleList ||
        [];
      setVehicleList(list);

      if (!selectedVehicle && list.length > 0) {
        setSelectedVehicle(String(list[0].id));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load vehicle list');
    }
  };

  const fetchConfiguration = async () => {
    if (!selectedVehicle) {
      resetThresholds();
      return;
    }

    try {
      setFetching(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/get-round-trip-fare`,
        {
          headers: { Authorization: token },
          params: { vehicle_type: selectedVehicle },
        }
      );

      if (res.data.success && res.data.data) {
        const formattedData = {};
        // The backend returns threshold1, threshold2, threshold3
        ['threshold1', 'threshold2', 'threshold3'].forEach((key) => {
          if (res.data.data[key]) {
            formattedData[key] = Object.fromEntries(
              Object.entries(res.data.data[key]).map(([k, v]) => [
                k,
                v === null || v === undefined ? '' : String(v),
              ])
            );
          } else {
            formattedData[key] = { ...emptyThreshold };
          }
        });
        setThresholds(formattedData);
      } else {
        // Reset to empty if no data found
        resetThresholds();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load configuration');
      resetThresholds();
    } finally {
      setFetching(false);
    }
  };

  const handleThresholdChange = (threshold, field, value) => {
    setThresholds((prev) => ({
      ...prev,
      [threshold]: {
        ...prev[threshold],
        [field]: value,
      },
    }));
  };

  const handleVehicleChange = (event) => {
    setSelectedVehicle(event.target.value);
  };


  const handleSave = async () => {
    try {
      setLoading(true);

      // convert strings → numbers before sending
      const payload = {};
      Object.keys(thresholds).forEach((key) => {
        payload[key] = Object.fromEntries(
          Object.entries(thresholds[key]).map(([k, v]) => [
            k,
            v === '' ? 0 : Number(v),
          ])
        );
      });

      payload.vehicle_type = selectedVehicle;

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/save-round-trip-fare`,
        payload,
        {
          headers: { Authorization: token },
          params: selectedVehicle ? { vehicle_type: selectedVehicle } : undefined,
        }
      );

      if (res.data.success) {
        toast.success('Configuration saved successfully');
      } else {
        toast.error(res.data.message || 'Failed to save configuration');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error saving configuration');
    } finally {
      setLoading(false);
    }
  };

  const fareRules = [
    'Parking cost extra as per slip',
    '200/hr will be charged for additional hours',
    '10/km will be charged for extra km',
    '210/- driver allowance per 24 hours',
    // '250/- night time allowance (11 PM - 06 AM)',
  ];

  const renderThresholdForm = (title, key) => (
    <Grid item xs={12} md={4}>
      <Card sx={{ p: 2, height: '100%', boxShadow: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {[
            ['Base Fare', 'baseFare'],
            ['Per Km (₹)', 'perKm'],
            ['Per Hour Charge', 'perHourCharge'],
            ['Kilometer Limit', 'kmLimit'],
            ['Extra Km Charges (₹)', 'extraKm'],
            ['Extra Hour Charges (₹)', 'extraHours'],
          ].map(([label, field]) => (
            <Grid item xs={12} key={field}>
              <TextField
                label={label}
                fullWidth
                size="small"
                type="number"
                value={thresholds[key][field]}
                onChange={(e) =>
                  handleThresholdChange(key, field, e.target.value)
                }
                inputProps={{ min: 0 }}
              />
            </Grid>
          ))}
        </Grid>
      </Card>
    </Grid>
  );

  if (fetching) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 200,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Alert severity="info" icon={<InfoIcon />}>
            <Typography fontWeight="bold" gutterBottom>
              Other Information
            </Typography>
            <Grid container spacing={1}>
              {fareRules.map((rule, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <InfoIcon sx={{ fontSize: 14, mr: 1, color: 'info.main' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      {rule}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Alert>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ maxWidth: 360 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="round-trip-vehicle-label">Vehicle Type</InputLabel>
              <Select
                labelId="round-trip-vehicle-label"
                value={selectedVehicle}
                label="Vehicle Type"
                onChange={handleVehicleChange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Vehicle Type
                </MenuItem>
                {vehicleList.map((vehicle) => (
                  <MenuItem key={vehicle.id} value={String(vehicle.id)}>
                    {vehicle.vehicle_type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>  
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={3}>
            {renderThresholdForm('Threshold 1', 'threshold1')}
            {renderThresholdForm('Threshold 2', 'threshold2')}
            {renderThresholdForm('Threshold 3', 'threshold3')}
          </Grid>
        </Grid>

        <Grid
          item
          xs={12}
          sx={{ display: 'flex', justifyContent: 'flex-end' }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={handleSave}
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {loading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoundTripManagement;
