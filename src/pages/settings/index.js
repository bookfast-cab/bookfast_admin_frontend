"use client";

import { useState, useEffect } from "react";
import { 
  Grid, 
  Card, 
  Typography, 
  TextField, 
  Button, 
  Snackbar, 
  Box, 
  Divider,
  InputAdornment,
  CircularProgress
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import SaveIcon from '@mui/icons-material/Save';

const Settings = () => {
  // Unified state for all pricing fields
  const [formData, setFormData] = useState({
    platform_commission: "",
    cancellation_penalties: "",
    realtime_ride_commission: "",
    bank_verification_fee: "",
    withdrawal_payment_fee: "",
    minimum_ride_distance:''
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("access_token");
      setToken(accessToken);
      if (accessToken) {
        fetchCharges(accessToken);
      } else {
        setErrorMessage("Access token not found. Please log in again.");
        setFetching(false);
      }
    }
  }, []);

  const fetchCharges = async (accessToken) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/charges`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken,
        },
      });

      const result = await res.json();

      if (result.success && result.data) {
        setFormData({
          platform_commission: result.data.platform_commission || "",
          cancellation_penalties: result.data.cancellation_penalties || "",
          realtime_ride_commission: result.data.realtime_ride_commission || "",
          bank_verification_fee: result.data.bank_verification_fee || "",
          withdrawal_payment_fee: result.data.withdrawal_payment_fee || "",
          minimum_ride_distance: result.data.minimum_ride_distance || "",
        });
      } else {
        setErrorMessage(result.message || "Failed to load pricing configurations.");
      }
    } catch (error) {
      console.error("Error fetching charges:", error);
      setErrorMessage("Error fetching pricing configurations.");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Basic validation to only allow numbers and decimals
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.platform_commission.trim() || !formData.cancellation_penalties.trim()) {
      setErrorMessage("Please fill in all mandatory fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/charges`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (result.success) {
        setSuccessMessage(result.message || "Charges updated successfully.");
      } else {
        setErrorMessage(result.message || "Failed to update charges.");
      }
    } catch (error) {
      console.error("Error updating charges:", error);
      setErrorMessage("Error updating charges.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  if (fetching) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, margin: "auto", p: { xs: 2, md: 4 } }}>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b", mb: 1 }}>
          General Setting
        </Typography>
      </Box>

      <Card sx={{ boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)", borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ p: 4 }}>
          {/* Section 1: Ride Operations */}
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#334155", mb: 3 }}>
            Ride Operations
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Platform Commission"
                name="platform_commission"
                variant="outlined"
                value={formData.platform_commission}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Realtime Ride Commission"
                name="realtime_ride_commission"
                variant="outlined"
                value={formData.realtime_ride_commission}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cancellation Penalties"
                name="cancellation_penalties"
                variant="outlined"
                value={formData.cancellation_penalties}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                helperText="Flat fee charged for cancelled rides"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Section 2: Payout Gateway Fees */}
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#334155", mb: 3 }}>
            Settlement & Gateway Fees
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bank Account Verification Fee"
                name="bank_verification_fee"
                variant="outlined"
                value={formData.bank_verification_fee}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                helperText="Cost of UPI/Bank validation via gateway"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Withdrawal Payment Fee"
                name="withdrawal_payment_fee"
                variant="outlined"
                value={formData.withdrawal_payment_fee}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                helperText="Standard IMPS/UPI transfer charge"
              />
            </Grid>
          </Grid>

           <Divider sx={{ my: 4 }} />

          {/* Section 2: Payout Gateway Fees */}
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#334155", mb: 3 }}>
            Ride Settings
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Ride Distance (in KM)"
                name="minimum_ride_distance"
                variant="outlined"
                value={formData.minimum_ride_distance}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">KM</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Action Footer */}
        <Box sx={{ px: 4, py: 3, bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            sx={{
              backgroundColor: "#2563eb",
              "&:hover": { backgroundColor: "#1d4ed8" },
              textTransform: "none",
              fontWeight: 600,
              px: 4,
              borderRadius: 2
            }}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving Changes..." : "Save Configuration"}
          </Button>
        </Box>
      </Card>

      {/* Notifications */}
      <Snackbar open={!!errorMessage} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <MuiAlert elevation={6} variant="filled" severity="error" onClose={handleCloseSnackbar}>
          {errorMessage}
        </MuiAlert>
      </Snackbar>

      <Snackbar open={!!successMessage} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <MuiAlert elevation={6} variant="filled" severity="success" onClose={handleCloseSnackbar}>
          {successMessage}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default Settings;