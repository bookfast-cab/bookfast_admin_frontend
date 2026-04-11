"use client";

import { useState, useEffect } from "react";
import { Grid, Card, Typography, TextField, Button, Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";

const HelplineSettings = () => {
  const [helplineNumber, setHelplineNumber] = useState("");
  const [helplineNumberDriver, setHelplineNumberDriver] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("access_token");
      setToken(accessToken);
      if (accessToken) {
        fetchHelpline(accessToken);
      } else {
        setErrorMessage("Access token not found. Please log in again.");
      }
    }
  }, []);

  const fetchHelpline = async (accessToken) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/helpline`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken,
        },
      });

      const result = await res.json();

      if (result.success && result.data) {
        setHelplineNumber(result.data.helpline_number || "");
        setHelplineNumberDriver(result.data.helpline_number_driver || "");
      } else {
        setErrorMessage(result.message || "Failed to load helpline number.");
      }
    } catch (error) {
      console.error("Error fetching helpline:", error);
      setErrorMessage("Error fetching helpline number.");
    }
  };

  const handleSave = async () => {
    if (!helplineNumber.trim()) {
      setErrorMessage("Helpline number cannot be empty.");
      
      return;

    }

    if (!helplineNumberDriver.trim()) {
      setErrorMessage("Helpline number driver cannot be empty.");
      
      return;

    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/helpline`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ helpline_number: helplineNumber, helpline_number_driver: helplineNumberDriver }),
      });

      const result = await res.json();

      if (result.success) {
        setSuccessMessage(result.message || "Helpline number updated successfully.");
      } else {
        setErrorMessage(result.message || "Failed to update helpline number.");
      }
    } catch (error) {
      console.error("Error updating helpline:", error);
      setErrorMessage("Error updating helpline number.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  return (
    <Grid container spacing={4} sx={{ bgcolor: "white", padding: 3 }}>
      <Grid item xs={12}>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1976d2" }}>
          Helpline Number Settings
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
            Update Helpline Number
          </Typography>

          <TextField
            fullWidth
            label="Helpline Number Customer"
            variant="outlined"
            value={helplineNumber}
            onChange={(e) => setHelplineNumber(e.target.value)}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Helpline Number Driver"
            variant="outlined"
            value={helplineNumberDriver}
            onChange={(e) => setHelplineNumberDriver(e.target.value)}
            sx={{ mb: 3 }}
          />

          <Button
            variant="contained"
            sx={{
              backgroundColor: "#1976d2",
              "&:hover": { backgroundColor: "#1565c0" },
              textTransform: "none",
              fontWeight: "bold",
            }}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Card>
      </Grid>


      <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert elevation={6} variant="filled" severity="error">
          {errorMessage}
        </MuiAlert>
      </Snackbar>

 
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert elevation={6} variant="filled" severity="success">
          {successMessage}
        </MuiAlert>
      </Snackbar>
    </Grid>
  );
};

export default HelplineSettings;
