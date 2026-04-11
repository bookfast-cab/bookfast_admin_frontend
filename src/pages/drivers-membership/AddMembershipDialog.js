import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableRow = styled(TableRow)(({ theme, selected }) => ({
  cursor: 'pointer',
  backgroundColor: selected ? theme.palette.action.selected : 'inherit',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const AddMembershipDialog = ({ open, onClose, driverId }) => {
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [customPlans, setCustomPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMode, setPaymentMode] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [error, setError] = useState('');

  const [customTitle, setCustomTitle] = useState('');
  const [customDays, setCustomDays] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  let token;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token');
  }

  const fetchMembershipPlans = async () => {
    setPlansLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/getMemberShipPlanByDriver/${driverId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch membership plans');
      }

      const data = await response.json();
      setMembershipPlans(data.availablePlans || []);
    } catch (err) {
      setError('Failed to load membership plans. Please try again.');
      console.error('Error fetching membership plans:', err);
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    if (open && driverId) {
      fetchMembershipPlans();
    }
  }, [open, driverId]);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handlePaymentModeChange = (event) => {
    setPaymentMode(event.target.value);
  };

 const handleSubmit = async () => {
  if (!selectedPlan) {
    setError('Please select a membership plan');
    
    return;
  }

  if (!paymentMode) {
    setError('Please select a payment mode');

    return;
  }

  setLoading(true);
  setError('');

  const isCustom = selectedPlan?.isCustom;

  const payload = {
    driver_id: driverId,
    plan_id: isCustom ? 0 : selectedPlan.plan_id,
    payment_mode: paymentMode,
    remarks: remarks,
  };

  // If custom, include name and days
  if (isCustom) {
    payload.plan_name = selectedPlan.plan_name;
    payload.duration_days = selectedPlan.duration_days;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/add-membership`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Failed to add membership');
    }

    const result = await response.json();
    handleClose();

    // Optionally: onSuccess && onSuccess(result);

  } catch (err) {
    setError('Failed to add membership. Please try again.');
    console.error('Error adding membership:', err);
  } finally {
    setLoading(false);
  }
};


  const handleClose = () => {
    setSelectedPlan(null);
    setPaymentMode('');
    setRemarks('');
    setCustomTitle('');
    setCustomDays('');
    setCustomPrice('');
    setCustomPlans([]);
    setError('');
    onClose();
  };

  const handleAddCustomPlan = () => {
    if (!customTitle || !customDays || !customPrice) {
      setError('Please fill all custom membership fields');

      return;
    }

    const newPlan = {
      plan_id: `custom-${Date.now()}`,
      plan_name: customTitle,
      duration_days: parseInt(customDays),
      price: parseFloat(customPrice),
      description: 'Custom Membership Plan',
      isCustom: true,
    };

    setCustomPlans((prev) => [...prev, newPlan]);
    setCustomTitle('');
    setCustomDays('');
    setCustomPrice('');
    setError('');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Membership for Driver ID: {driverId}</DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Add Custom Plan Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Add Custom Membership Plan
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              label="Membership Title"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <TextField
              label="Days"
              type="number"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              sx={{ flex: 1, minWidth: 120 }}
            />
            <TextField
              label="Price (₹)"
              type="number"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              sx={{ flex: 1, minWidth: 120 }}
            />
            <Button
              variant="outlined"
              onClick={handleAddCustomPlan}
              sx={{ height: '56px' }}
            >
              Add Custom
            </Button>
          </Box>
        </Box>

        {/* Membership Plans Table */}
        <Typography variant="h6" gutterBottom>
          Select Membership Plan
        </Typography>

        {plansLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Plan Name</TableCell>
                  <TableCell>Duration (Days)</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...customPlans, ...membershipPlans].map((plan) => (
                  <StyledTableRow
                    key={plan.plan_id}
                    selected={selectedPlan?.plan_id === plan.plan_id}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {plan.plan_name}
                      </Typography>
                    </TableCell>
                    <TableCell>{plan.duration_days}</TableCell>
                    <TableCell>₹{plan.price}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {plan.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {selectedPlan?.plan_id === plan.plan_id && (
                        <Chip label="Selected" color="primary" size="small" />
                      )}
                      {plan.isCustom && (
                        <Chip label="Custom" color="secondary" size="small" sx={{ ml: 1 }} />
                      )}
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Form - Show only when plan is selected */}
        {selectedPlan && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Membership Details
            </Typography>

            <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Selected Plan: {selectedPlan.plan_name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Duration: {selectedPlan.duration_days} days | Price: ₹{selectedPlan.price}
              </Typography>
            </Box>

            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">Payment Mode *</FormLabel>
              <RadioGroup
                value={paymentMode}
                onChange={handlePaymentModeChange}
                row
              >
                <FormControlLabel value="online" control={<Radio />} label="Online" />
                <FormControlLabel value="cash" control={<Radio />} label="Cash" />
                <FormControlLabel value="wallet" control={<Radio />} label="Wallet" />
              </RadioGroup>
            </FormControl>

            <TextField
              label="Remarks"
              multiline
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="Enter any additional remarks..."
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !selectedPlan || !paymentMode}
        >
          {loading ? <CircularProgress size={20} /> : 'Add Membership'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMembershipDialog;
