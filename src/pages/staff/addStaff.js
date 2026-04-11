"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import {
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Snackbar,
  Typography,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";

const AddStaff = () => {
  const router = useRouter();
  
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "staff",
    status: "active",
  });

  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    let errors = {};
    let valid = true;

    if (!formData.name) {
      errors.name = "Name is required";
      valid = false;
    }
    if (!formData.username) {
      errors.username = "Username is required";
      valid = false;
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Valid email is required";
      valid = false;
    }
    if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone)) {
      errors.phone = "Valid 10-digit phone number is required";
      valid = false;
    }
    if (!formData.password || formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
      valid = false;
    }
    if (!formData.role) {
      errors.role = "Role is required";
      valid = false;
    }

    setFormErrors(errors);

    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/staff`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccessMessage("Staff added successfully!");
        setTimeout(() => {
          router.push("/staff");
        }, 1500);
      } else {
        setErrorMessage(data.message || "Failed to add staff");
      }
    } catch (err) {
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  const handleCloseSnackbar = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  return (
    <Card>
      <CardContent>
        <Grid container spacing={6}>
          <Grid item xs={6}>
            <Typography variant="h6">Add Staff</Typography>
          </Grid>
          <Grid item xs={6} style={{ textAlign: "right" }}>
            <Button variant="contained" onClick={() => router.push("/staff")}>
              Back
            </Button>
          </Grid>
        </Grid>

        <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
          {/* Name */}
          <TextField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!formErrors.name}
            helperText={formErrors.name}
          />

          {/* Username */}
          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!formErrors.username}
            helperText={formErrors.username}
          />

          {/* Email */}
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!formErrors.email}
            helperText={formErrors.email}
          />

          {/* Phone */}
          <TextField
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!formErrors.phone}
            helperText={formErrors.phone}
          />

          {/* Password */}
          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!formErrors.password}
            helperText={formErrors.password}
          />

          {/* Role */}
          <InputLabel id="role-label" sx={{ mt: 2 }}>
            Role
          </InputLabel>
          <Select
            labelId="role-label"
            name="role"
            value={formData.role}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="staff">Staff</MenuItem>
            <MenuItem value="seo">SEO</MenuItem>
          </Select>
          {formErrors.role && (
            <FormHelperText error>{formErrors.role}</FormHelperText>
          )}

          {/* Status */}
          <InputLabel id="status-label" sx={{ mt: 2 }}>
            Status
          </InputLabel>
          <Select
            labelId="status-label"
            name="status"
            value={formData.status}
            onChange={handleChange}
            fullWidth
          >
            <MenuItem value="yes">Active</MenuItem>
            <MenuItem value="no">Inactive</MenuItem>
          </Select>

          {/* Submit Button */}
          <Button
            sx={{ mt: 3 }}
            variant="contained"
            color="primary"
            type="submit"
          >
            Submit
          </Button>
        </form>

        {/* Error Snackbar */}
        <Snackbar
          open={!!errorMessage}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={handleCloseSnackbar}
            severity="error"
          >
            {errorMessage}
          </MuiAlert>
        </Snackbar>

        {/* Success Snackbar */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            onClose={handleCloseSnackbar}
            severity="success"
          >
            {successMessage}
          </MuiAlert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

export default AddStaff;
