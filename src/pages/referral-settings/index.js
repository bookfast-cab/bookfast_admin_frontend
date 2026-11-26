"use client";

import { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  TextField,
  Button,
  Snackbar,
  Box,
  Divider,
  InputAdornment,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import ShareIcon from "@mui/icons-material/Share";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import PreviewIcon from "@mui/icons-material/Visibility";
import AndroidIcon from "@mui/icons-material/Android";
import AppleIcon from "@mui/icons-material/Apple";

const ReferralSettings = () => {
  const [formData, setFormData] = useState({
    title: "Refer & Earn",
    description: "",
    referral_amount: "100",
    driver_referral_amount: "100",
    share_message: "",
    share_url: "https://bookfast.in",
    share_url_android: "",
    share_url_ios: "",
    status: 1
  });

  const [steps, setSteps] = useState([
    "Share your referral code with your friends & family.",
    "Friend downloads Bookfast and registers using your code.",
    "When your friend completes their first ride, both get wallet rewards!"
  ]);
  const [newStepText, setNewStepText] = useState("");

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
        fetchReferralSettings(accessToken);
      } else {
        setErrorMessage("Access token not found. Please log in again.");
        setFetching(false);
      }
    }
  }, []);

  const fetchReferralSettings = async (accessToken) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/referral-settings`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken
          }
        }
      );

      const result = await res.json();

      if (result.success && result.data) {
        const d = result.data;
        setFormData({
          title: d.title || "Refer & Earn",
          description: d.description || "",
          referral_amount: String(d.referral_amount ?? 100),
          driver_referral_amount: String(d.driver_referral_amount ?? 100),
          share_message: d.share_message || "",
          share_url: d.share_url || "https://bookfast.in",
          share_url_android: d.share_url_android || d.android_app_link || "",
          share_url_ios: d.share_url_ios || d.ios_app_link || "",
          status: d.status !== undefined ? d.status : 1
        });

        // Parse how_it_works
        if (Array.isArray(d.how_it_works_parsed)) {
          setSteps(d.how_it_works_parsed);
        } else if (typeof d.how_it_works === "string") {
          try {
            const parsed = JSON.parse(d.how_it_works);
            if (Array.isArray(parsed)) {
              setSteps(parsed);
            } else {
              setSteps(d.how_it_works.split("\n").filter(Boolean));
            }
          } catch {
            setSteps(d.how_it_works.split("\n").filter(Boolean));
          }
        }
      } else {
        setErrorMessage(result.message || "Failed to load referral settings.");
      }
    } catch (error) {
      console.error("Error fetching referral settings:", error);
      setErrorMessage("Error fetching referral settings.");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddStep = () => {
    if (!newStepText.trim()) return;
    setSteps([...steps, newStepText.trim()]);
    setNewStepText("");
  };

  const handleDeleteStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleStepChange = (index, value) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setErrorMessage("Referral title is required.");
      
return;
    }
    if (!formData.referral_amount || isNaN(formData.referral_amount)) {
      setErrorMessage("Valid customer referral reward amount is required.");
      
return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/referral-settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            referral_amount: parseFloat(formData.referral_amount),
            driver_referral_amount: parseFloat(formData.driver_referral_amount || "0"),
            share_message: formData.share_message,
            share_url: formData.share_url,
            share_url_android: formData.share_url_android,
            share_url_ios: formData.share_url_ios,
            android_app_link: formData.share_url_android,
            ios_app_link: formData.share_url_ios,
            how_it_works: steps,
            status: formData.status
          })
        }
      );

      const result = await res.json();
      if (result.success) {
        setSuccessMessage("Referral settings updated successfully!");
      } else {
        setErrorMessage(result.message || "Failed to update referral settings.");
      }
    } catch (error) {
      console.error("Error saving referral settings:", error);
      setErrorMessage("An error occurred while saving referral settings.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  // Sample preview of share message
  const previewShareMessage = (formData.share_message || "")
    .replace(/{code}/g, "BKFST99")
    .replace(/{url}/g, formData.share_url || "https://bookfast.in")
    .replace(/{android_url}/g, formData.share_url_android || "https://play.google.com/store/apps/details?id=com.bookfast.customer")
    .replace(/{ios_url}/g, formData.share_url_ios || "https://apps.apple.com/app/bookfast/id123456789");

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <div>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Referral & Earn Settings
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Manage customer referral reward amount, content, share message, and &quot;How It Works&quot; steps.
            </Typography>
          </div>
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={loading}
            sx={{ px: 4, py: 1.2, borderRadius: 2 }}
          >
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </Box>
      </Grid>

      {/* Reward Pricing Card */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: "100%", borderRadius: 2, boxShadow: 2 }}>
          <CardHeader
            avatar={<CardGiftcardIcon color="primary" />}
            title={<Typography variant="h6" fontWeight={600}>Reward & Pricing</Typography>}
            subheader="Configure referral bonus credited to customers and drivers"
          />
          <Divider />
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 3 }}>
            <TextField
              fullWidth
              label="Customer Referral Reward"
              name="referral_amount"
              value={formData.referral_amount}
              onChange={handleChange}
              type="number"
              helperText="Amount in ₹ credited when a referred customer signs up and rides"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>
              }}
            />

            <TextField
              fullWidth
              label="Driver Referral Reward"
              name="driver_referral_amount"
              value={formData.driver_referral_amount}
              onChange={handleChange}
              type="number"
              helperText="Amount in ₹ credited for driver referrals"
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Program Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                label="Program Status"
                onChange={handleChange}
              >
                <MenuItem value={1}>Active (Visible to users)</MenuItem>
                <MenuItem value={0}>Disabled</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      </Grid>

      {/* Share URL & Links Card */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: "100%", borderRadius: 2, boxShadow: 2 }}>
          <CardHeader
            avatar={<ShareIcon color="primary" />}
            title={<Typography variant="h6" fontWeight={600}>Share Link & Messaging</Typography>}
            subheader="Customize Android & iOS app download links and share message"
          />
          <Divider />
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 3 }}>
            <TextField
              fullWidth
              label="Android App Link (Play Store)"
              name="share_url_android"
              value={formData.share_url_android}
              onChange={handleChange}
              placeholder="https://play.google.com/store/apps/details?id=com.bookfast.customer"
              helperText="Google Play Store link (placeholder: {android_url})"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AndroidIcon color="success" />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label="iOS App Link (App Store)"
              name="share_url_ios"
              value={formData.share_url_ios}
              onChange={handleChange}
              placeholder="https://apps.apple.com/app/bookfast/id123456789"
              helperText="Apple App Store link (placeholder: {ios_url})"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AppleIcon color="action" />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              fullWidth
              label="General / Web Share URL"
              name="share_url"
              value={formData.share_url}
              onChange={handleChange}
              placeholder="https://bookfast.in"
              helperText="Fallback or website link (placeholder: {url})"
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Share Message Template"
              name="share_message"
              value={formData.share_message}
              onChange={handleChange}
              helperText="Use placeholders {code}, {android_url}, {ios_url}, or {url}"
            />

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Chip label="{code} = Referral Code" size="small" variant="outlined" color="primary" />
              <Chip label="{android_url} = Android Link" size="small" variant="outlined" color="success" />
              <Chip label="{ios_url} = iOS Link" size="small" variant="outlined" color="secondary" />
              <Chip label="{url} = General URL" size="small" variant="outlined" color="default" />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Content & Headings Card */}
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardHeader
            title={<Typography variant="h6" fontWeight={600}>App Display Content</Typography>}
            subheader="Headings and descriptions shown on the mobile app screen"
          />
          <Divider />
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 3 }}>
            <TextField
              fullWidth
              label="Page Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Refer & Earn"
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Subtitle / Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Invite your friends to Bookfast. You earn ₹100 reward in your wallet when they complete their first ride!"
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Live Preview Card */}
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 2, boxShadow: 2, backgroundColor: "#fafbfc" }}>
          <CardHeader
            avatar={<PreviewIcon color="secondary" />}
            title={<Typography variant="h6" fontWeight={600}>Mobile App Live Preview</Typography>}
            subheader="How users see this in the mobile app"
          />
          <Divider />
          <CardContent>
            <Paper
              elevation={2}
              sx={{
                p: 2.5,
                borderRadius: 2,
                backgroundColor: "#fff",
                border: "1px solid #e0e0e0"
              }}
            >
              <Typography variant="caption" sx={{ color: "#ff7700", fontWeight: 700, textTransform: "uppercase" }}>
                REFER &amp; EARN
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5, color: "#1a1a1a" }}>
                {formData.title || "Refer & Earn"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>
                {formData.description || "Share with friends and earn rewards!"}
              </Typography>

              <Box sx={{ mt: 2, p: 1.5, backgroundColor: "#f5f5f5", borderRadius: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: "#777" }}>
                  REFERRAL CODE
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, letterSpacing: 1.5, color: "#ff7700" }}>
                  BKFST99
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" sx={{ fontWeight: 700, color: "#888", display: "block", mb: 0.5 }}>
                SHARE MESSAGE PREVIEW:
              </Typography>
              <Box sx={{ p: 1.5, backgroundColor: "#eef6ff", borderRadius: 1.5, borderLeft: "4px solid #1976d2" }}>
                <Typography variant="caption" sx={{ color: "#1976d2", whiteSpace: "pre-wrap" }}>
                  {previewShareMessage || "Hey! Use my referral code BKFST99 on Bookfast!"}
                </Typography>
              </Box>
            </Paper>
          </CardContent>
        </Card>
      </Grid>

      {/* How It Works Steps Card */}
      <Grid item xs={12}>
        <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
          <CardHeader
            avatar={<FormatListNumberedIcon color="primary" />}
            title={<Typography variant="h6" fontWeight={600}>&quot;How It Works&quot; Steps</Typography>}
            subheader="The exact bullet points shown to customers explaining the referral process"
          />
          <Divider />
          <CardContent sx={{ pt: 3 }}>
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Add New Step"
                placeholder="e.g. When friend completes first ride, both get reward in wallet"
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddStep();
                  }
                }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddStep}
                disabled={!newStepText.trim()}
                sx={{ whiteSpace: "nowrap", borderRadius: 2 }}
              >
                Add Step
              </Button>
            </Box>

            <List disablePadding>
              {steps.map((step, idx) => (
                <ListItem
                  key={idx}
                  sx={{
                    mb: 1.5,
                    p: 1.5,
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    backgroundColor: "#fafafa"
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      backgroundColor: "#ff7700",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 13,
                      mr: 2,
                      flexShrink: 0
                    }}
                  >
                    {idx + 1}
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    variant="standard"
                    value={step}
                    onChange={(e) => handleStepChange(idx, e.target.value)}
                    InputProps={{ disableUnderline: false }}
                  />
                  <IconButton
                    edge="end"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteStep(idx)}
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItem>
              ))}
            </List>

            {steps.length === 0 && (
              <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 3 }}>
                No steps added yet. Click &quot;Add Step&quot; above to add steps.
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Snackbar alerts */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={4000}
        onClose={() => setErrorMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert elevation={6} variant="filled" onClose={() => setErrorMessage("")} severity="error">
          {errorMessage}
        </MuiAlert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert elevation={6} variant="filled" onClose={() => setSuccessMessage("")} severity="success">
          {successMessage}
        </MuiAlert>
      </Snackbar>
    </Grid>
  );
};

export default ReferralSettings;
