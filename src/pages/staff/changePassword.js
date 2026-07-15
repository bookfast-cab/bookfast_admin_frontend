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
  InputAdornment,
  IconButton,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const ChangePassword = () => {
  const router = useRouter();
  
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
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
    if (!formData.currentPassword) errors.currentPassword = "Current password is required";
    if (!formData.newPassword || formData.newPassword.length < 6) errors.newPassword = "New password must be at least 6 characters";
    if (formData.newPassword !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match";
    
    setFormErrors(errors);

    return Object.keys(errors).length === 0;
    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const token = localStorage.getItem("access_token");
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/change-password`,
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
        setSuccessMessage("Password changed successfully!");
        setTimeout(() => router.push("/staff"), 1500);
      } else {
        setErrorMessage(data.message || "Failed to change password");
      }
    } catch (err) {
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  const renderPasswordField = (label, name) => (
    <TextField
      label={label}
      name={name}
      type={showPassword ? "text" : "password"}
      value={formData[name]}
      onChange={handleChange}
      fullWidth
      margin="normal"
      error={!!formErrors[name]}
      helperText={formErrors[name]}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );

  return (
    <Card sx={{ maxWidth: 500, mx: "auto", mt: 5 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Change Password</Typography>

        <form onSubmit={handleSubmit}>
          {renderPasswordField("New Password", "newPassword")}
          {renderPasswordField("Confirm New Password", "confirmPassword")}

          <Button sx={{ mt: 3 }} variant="contained" color="primary" type="submit" fullWidth>
            Update Password
          </Button>
          <Button sx={{ mt: 1 }} variant="text" fullWidth onClick={() => router.back()}>
            Cancel
          </Button>
        </form>

        <Snackbar open={!!errorMessage || !!successMessage} autoHideDuration={3000} onClose={() => {setErrorMessage(""); setSuccessMessage("")}}>
          <MuiAlert severity={errorMessage ? "error" : "success"}>
            {errorMessage || successMessage}
          </MuiAlert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

export default ChangePassword;