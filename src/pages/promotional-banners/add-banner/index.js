"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Grid, Card, Typography, TextField, Button, Snackbar, MenuItem,
    Select, InputLabel, FormControl, Box, CircularProgress,
    Drawer, Divider, Checkbox, Avatar, Chip, InputAdornment,
    IconButton, Pagination, Stack, Badge, Tooltip
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { useRouter } from "next/router";
import moment from "moment";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// ─── User Selection Drawer ────────────────────────────────────────────────────

const UserSelectionDrawer = ({ open, onClose, audienceType, token, selectedUsers, onSelectionChange }) => {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [customers, setCustomers] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [customerPage, setCustomerPage] = useState(1);
    const [driverPage, setDriverPage] = useState(1);
    const [customerTotal, setCustomerTotal] = useState(0);
    const [driverTotal, setDriverTotal] = useState(0);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [loadingDrivers, setLoadingDrivers] = useState(false);
    const perPage = 10;

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);

        return () => clearTimeout(t);
    }, [search]);

    // Reset pages when search changes
    useEffect(() => {
        setCustomerPage(1);
        setDriverPage(1);
    }, [debouncedSearch]);

    const fetchCustomers = useCallback(async () => {
        if (!token || (audienceType !== "customer" && audienceType !== "both")) return;
        setLoadingCustomers(true);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customers?page=${customerPage - 1}&perPage=${perPage}&search=${encodeURIComponent(debouncedSearch)}`,
                { headers: { Authorization: token } }
            );
            const data = await res.json();
            if (data.success) {
                setCustomers(data.data || []);
                setCustomerTotal(data.totalPages || 0);
            }
        } catch (e) {
            console.error("Error fetching customers:", e);
        } finally {
            setLoadingCustomers(false);
        }
    }, [token, audienceType, customerPage, debouncedSearch]);

    const fetchDrivers = useCallback(async () => {
        if (!token || (audienceType !== "driver" && audienceType !== "both")) return;
        setLoadingDrivers(true);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/drivers?page=${driverPage}&perPage=${perPage}&search=${encodeURIComponent(debouncedSearch)}`,
                { headers: { Authorization: token } }
            );
            const data = await res.json();
            if (data.success) {
                setDrivers(data.data || []);
                setDriverTotal(data.totalPages || 0);
            }
        } catch (e) {
            console.error("Error fetching drivers:", e);
        } finally {
            setLoadingDrivers(false);
        }
    }, [token, audienceType, driverPage, debouncedSearch]);

    useEffect(() => { if (open) fetchCustomers(); }, [open, fetchCustomers]);
    useEffect(() => { if (open) fetchDrivers(); }, [open, fetchDrivers]);

    const toggle = (id) => {
        const already = selectedUsers.includes(id);
        onSelectionChange(already ? selectedUsers.filter(u => u !== id) : [...selectedUsers, id]);
    };

    const selectAll = (list, idFn) => {
        const ids = list.map(idFn);
        const allSelected = ids.every(id => selectedUsers.includes(id));
        if (allSelected) {
            onSelectionChange(selectedUsers.filter(id => !ids.includes(id)));
        } else {
            const newSet = new Set([...selectedUsers, ...ids]);
            onSelectionChange([...newSet]);
        }
    };

    const UserRow = ({ id, name, phone, type }) => {
        const isSelected = selectedUsers.includes(id);

        return (
            <Box
                onClick={() => toggle(id)}
                sx={{
                    display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.2,
                    cursor: "pointer", borderRadius: 1, mb: 0.5,
                    bgcolor: isSelected ? "primary.50" : "transparent",
                    border: isSelected ? "1px solid" : "1px solid transparent",
                    borderColor: isSelected ? "primary.main" : "transparent",
                    "&:hover": { bgcolor: isSelected ? "primary.50" : "action.hover" },
                    transition: "all 0.15s"
                }}
            >
                <Checkbox
                    checked={isSelected}
                    disableRipple
                    size="small"
                    sx={{ p: 0 }}
                    onClick={e => e.stopPropagation()}
                    onChange={() => toggle(id)}
                />
                <Avatar sx={{ width: 32, height: 32, bgcolor: type === "customer" ? "primary.main" : "success.main", fontSize: 13 }}>
                    {name?.charAt(0)?.toUpperCase() || (type === "customer" ? "C" : "D")}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{name || "—"}</Typography>
                    <Typography variant="caption" color="text.secondary">{phone || "No phone"}</Typography>
                </Box>
                {isSelected && <CheckCircleIcon sx={{ color: "primary.main", fontSize: 18 }} />}
            </Box>
        );
    };

    const showCustomers = audienceType === "customer" || audienceType === "both";
    const showDrivers = audienceType === "driver" || audienceType === "both";

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: "100%", sm: 420 },
                    display: "flex", flexDirection: "column"
                }
            }}
        >
            {/* Header */}
            <Box sx={{ px: 2.5, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid", borderColor: "divider" }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Select Users</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {selectedUsers.length} user{selectedUsers.length !== 1 ? "s" : ""} selected
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Search */}
            <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by name, phone..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                        endAdornment: search && (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearch("")}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
            </Box>

            {/* List */}
            <Box sx={{ flex: 1, overflowY: "auto", px: 1, py: 1 }}>
                {/* Customers Section */}
                {showCustomers && (
                    <>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.5, py: 0.8 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <PersonIcon sx={{ fontSize: 18, color: "primary.main" }} />
                                <Typography variant="subtitle2" fontWeight={700} color="primary.main">Customers</Typography>
                            </Box>
                            {customers.length > 0 && (
                                <Button size="small" sx={{ fontSize: 11 }} onClick={() => selectAll(customers, c => `customer-${c.id}`)}>
                                    {customers.every(c => selectedUsers.includes(`customer-${c.id}`)) ? "Deselect Page" : "Select Page"}
                                </Button>
                            )}
                        </Box>
                        {loadingCustomers ? (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                                <CircularProgress size={22} />
                            </Box>
                        ) : customers.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1 }}>No customers found.</Typography>
                        ) : (
                            customers.map(c => (
                                <UserRow
                                    key={`customer-${c.id}`}
                                    id={`customer-${c.id}`}
                                    name={c.name || c.first_name || "Customer"}
                                    phone={c.phone_number}
                                    type="customer"
                                />
                            ))
                        )}
                        {customerTotal > 1 && (
                            <Stack alignItems="center" sx={{ py: 1 }}>
                                <Pagination
                                    count={customerTotal}
                                    page={customerPage}
                                    onChange={(_, v) => setCustomerPage(v)}
                                    size="small"
                                    color="primary"
                                />
                            </Stack>
                        )}
                    </>
                )}

                {showCustomers && showDrivers && <Divider sx={{ my: 1 }} />}

                {/* Drivers Section */}
                {showDrivers && (
                    <>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.5, py: 0.8 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <DirectionsCarIcon sx={{ fontSize: 18, color: "success.main" }} />
                                <Typography variant="subtitle2" fontWeight={700} color="success.main">Drivers</Typography>
                            </Box>
                            {drivers.length > 0 && (
                                <Button size="small" sx={{ fontSize: 11 }} onClick={() => selectAll(drivers, d => `driver-${d.id}`)}>
                                    {drivers.every(d => selectedUsers.includes(`driver-${d.id}`)) ? "Deselect Page" : "Select Page"}
                                </Button>
                            )}
                        </Box>
                        {loadingDrivers ? (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                                <CircularProgress size={22} />
                            </Box>
                        ) : drivers.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1 }}>No drivers found.</Typography>
                        ) : (
                            drivers.map(d => (
                                <UserRow
                                    key={`driver-${d.id}`}
                                    id={`driver-${d.id}`}
                                    name={d.driverName || d.name || "Driver"}
                                    phone={d.phone_number}
                                    type="driver"
                                />
                            ))
                        )}
                        {driverTotal > 1 && (
                            <Stack alignItems="center" sx={{ py: 1 }}>
                                <Pagination
                                    count={driverTotal}
                                    page={driverPage}
                                    onChange={(_, v) => setDriverPage(v)}
                                    size="small"
                                    color="success"
                                />
                            </Stack>
                        )}
                    </>
                )}
            </Box>

            {/* Footer */}
            <Box sx={{ px: 2.5, py: 2, borderTop: "1px solid", borderColor: "divider", display: "flex", gap: 1.5 }}>
                <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => onSelectionChange([])}
                    disabled={selectedUsers.length === 0}
                    sx={{ flex: 1 }}
                >
                    Clear All
                </Button>
                <Button
                    variant="contained"
                    size="small"
                    onClick={onClose}
                    sx={{ flex: 2 }}
                >
                    Done ({selectedUsers.length} selected)
                </Button>
            </Box>
        </Drawer>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AddPromotionalBanner = () => {
    const router = useRouter();
    const { id } = router.query;
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        audience_type: "both",
        target_type: "all",
        display_type: "multiple",
        priority: 0,
        status: 1,
        start_time: moment().format("YYYY-MM-DDTHH:mm"),
        end_time: ""
    });

    const [selectedUsers, setSelectedUsers] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [token, setToken] = useState(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const accessToken = localStorage.getItem("access_token");
            setToken(accessToken);
            if (accessToken && isEditMode) {
                fetchBannerDetails(accessToken, id);
            }
        }
    }, [id, isEditMode]);

    const fetchBannerDetails = async (accessToken, bannerId) => {
        setInitialLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/promotional-banners/${bannerId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json", Authorization: accessToken },
            });
            const result = await res.json();
            if (res.ok && result.success) {
                const data = result.data;
                let parsedTargetUsers = [];
                if (data.target_users) {
                    try { parsedTargetUsers = JSON.parse(data.target_users); } catch (e) { }
                }
                setFormData({
                    title: data.title || "",
                    description: data.description || "",
                    audience_type: data.audience_type || "both",
                    target_type: data.target_type || "all",
                    display_type: data.display_type || "multiple",
                    priority: data.priority || 0,
                    status: data.status,
                    start_time: data.start_time ? moment(data.start_time).format("YYYY-MM-DDTHH:mm") : "",
                    end_time: data.end_time ? moment(data.end_time).format("YYYY-MM-DDTHH:mm") : ""
                });
                setSelectedUsers(Array.isArray(parsedTargetUsers) ? parsedTargetUsers : []);
                if (data.image_url) setImagePreview(data.image_url);
            } else {
                setErrorMessage(result.message || "Failed to load banner details.");
            }
        } catch (error) {
            setErrorMessage("Error fetching banner details.");
        } finally {
            setInitialLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // If target_type changed away from 'selected', clear selections
        if (name === "target_type" && value !== "selected") {
            setSelectedUsers([]);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            setErrorMessage("Title is required.");

            return;
        }
        if (!isEditMode && !imageFile) {
            setErrorMessage("Banner image is required.");
            
            return;
        }
        if (formData.target_type === "selected" && selectedUsers.length === 0) {
            setErrorMessage("Please select at least one user when Target Type is 'Selected Users'.");

            return;
        }

        setLoading(true);
        try {
            const formPayload = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== "") {
                    formPayload.append(key, formData[key]);
                }
            });

            // Append selected users as JSON
            if (formData.target_type === "selected" && selectedUsers.length > 0) {
                selectedUsers.forEach(u => formPayload.append("target_users[]", u));
            }

            if (imageFile) formPayload.append("image", imageFile);

            const url = isEditMode
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/promotional-banners/${id}`
                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/promotional-banners`;
            const method = isEditMode ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { Authorization: token },
                body: formPayload,
            });
            const result = await res.json();

            if (res.ok && result.success) {
                setSuccessMessage(`Banner ${isEditMode ? "updated" : "created"} successfully.`);
                setTimeout(() => router.push("/promotional-banners"), 1500);
            } else {
                setErrorMessage(result.message || `Failed to ${isEditMode ? "update" : "create"} banner.`);
            }
        } catch (error) {
            setErrorMessage(`Error ${isEditMode ? "updating" : "creating"} banner.`);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setErrorMessage("");
        setSuccessMessage("");
    };

    // Helper: render selected user chips inside the button area
    const renderSelectedChips = () => {
        if (selectedUsers.length === 0) return null;
        const displayed = selectedUsers.slice(0, 3);

        return (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                {displayed.map(uid => {
                    const isCustomer = uid.startsWith("customer-");

                    return (
                        <Chip
                            key={uid}
                            size="small"
                            label={`${isCustomer ? "Customer" : "Driver"} #${uid.split("-")[1]}`}
                            icon={isCustomer ? <PersonIcon style={{ fontSize: 13 }} /> : <DirectionsCarIcon style={{ fontSize: 13 }} />}
                            color={isCustomer ? "primary" : "success"}
                            variant="outlined"
                            onDelete={() => setSelectedUsers(prev => prev.filter(u => u !== uid))}
                        />
                    );
                })}
                {selectedUsers.length > 3 && (
                    <Chip size="small" label={`+${selectedUsers.length - 3} more`} variant="outlined" />
                )}
            </Box>
        );
    };

    if (initialLoading) {

        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                        {isEditMode ? "Edit Promotional Banner" : "Add Promotional Banner"}
                    </Typography>
                </Grid>

                <Grid item xs={12}>
                    <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                {/* Title & Priority */}
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Banner Title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Priority (e.g. 1 is highest)"
                                        name="priority"
                                        type="number"
                                        value={formData.priority}
                                        onChange={handleChange}
                                    />
                                </Grid>

                                {/* Description */}
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Description"
                                        name="description"
                                        multiline
                                        rows={3}
                                        value={formData.description}
                                        onChange={handleChange}
                                    />
                                </Grid>

                                {/* Dropdowns */}
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Audience Type</InputLabel>
                                        <Select
                                            name="audience_type"
                                            value={formData.audience_type}
                                            onChange={handleChange}
                                            label="Audience Type"
                                        >
                                            <MenuItem value="both">Both (Drivers & Customers)</MenuItem>
                                            <MenuItem value="customer">Customers Only</MenuItem>
                                            <MenuItem value="driver">Drivers Only</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Display Type</InputLabel>
                                        <Select
                                            name="display_type"
                                            value={formData.display_type}
                                            onChange={handleChange}
                                            label="Display Type"
                                        >
                                            <MenuItem value="multiple">Show Multiple Times</MenuItem>
                                            <MenuItem value="once">Show Only Once Per User</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Target Type</InputLabel>
                                        <Select
                                            name="target_type"
                                            value={formData.target_type}
                                            onChange={handleChange}
                                            label="Target Type"
                                        >
                                            <MenuItem value="all">All Users</MenuItem>
                                            <MenuItem value="selected">Selected Users</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* User Selection Button (shown only when target_type = selected) */}
                                {formData.target_type === "selected" && (
                                    <Grid item xs={12}>
                                        <Box
                                            sx={{
                                                border: "1px solid",
                                                borderColor: selectedUsers.length > 0 ? "primary.main" : "divider",
                                                borderRadius: 2,
                                                p: 2,
                                                bgcolor: "background.paper"
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <PeopleAltIcon color="primary" />
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        Target Users
                                                        {selectedUsers.length > 0 && (
                                                            <Typography component="span" variant="caption" sx={{ ml: 1, color: "primary.main", fontWeight: 700 }}>
                                                                ({selectedUsers.length} selected)
                                                            </Typography>
                                                        )}
                                                    </Typography>
                                                </Box>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<PeopleAltIcon />}
                                                    onClick={() => setDrawerOpen(true)}
                                                    sx={{ textTransform: "none" }}
                                                >
                                                    {selectedUsers.length > 0 ? "Manage Selection" : "Select Users"}
                                                </Button>
                                            </Box>

                                            {selectedUsers.length === 0 ? (
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                    No users selected yet. Click "Select Users" to open the panel.
                                                </Typography>
                                            ) : (
                                                renderSelectedChips()
                                            )}
                                        </Box>
                                    </Grid>
                                )}

                                {/* Status */}
                                <Grid item xs={12} sm={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            label="Status"
                                        >
                                            <MenuItem value={1}>Active</MenuItem>
                                            <MenuItem value={0}>Inactive</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Dates */}
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Start Time"
                                        name="start_time"
                                        type="datetime-local"
                                        InputLabelProps={{ shrink: true }}
                                        value={formData.start_time}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="End Time (Leave empty for no expiry)"
                                        name="end_time"
                                        type="datetime-local"
                                        InputLabelProps={{ shrink: true }}
                                        value={formData.end_time}
                                        onChange={handleChange}
                                    />
                                </Grid>

                                {/* Image Upload */}
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Banner Image *</Typography>
                                    <Button variant="outlined" component="label" sx={{ mb: 2 }}>
                                        Upload Image
                                        <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                    </Button>
                                    {imagePreview && (
                                        <Box sx={{ mt: 2, mb: 2 }}>
                                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>Preview:</Typography>
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "8px", border: "1px solid #ddd" }}
                                            />
                                        </Box>
                                    )}
                                </Grid>

                                {/* Action Buttons */}
                                <Grid item xs={12} sx={{ display: "flex", gap: 2, mt: 2 }}>
                                    <Button variant="contained" color="primary" type="submit" disabled={loading}>
                                        {loading ? "Saving..." : "Save Banner"}
                                    </Button>
                                    <Button variant="outlined" color="secondary" onClick={() => router.push("/promotional-banners")}>
                                        Cancel
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Card>
                </Grid>

                {/* Snackbars */}
                <Snackbar open={!!errorMessage} autoHideDuration={5000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                    <MuiAlert elevation={6} variant="filled" severity="error">{errorMessage}</MuiAlert>
                </Snackbar>
                <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
                    <MuiAlert elevation={6} variant="filled" severity="success">{successMessage}</MuiAlert>
                </Snackbar>
            </Grid>

            {/* User Selection Drawer */}
            <UserSelectionDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                audienceType={formData.audience_type}
                token={token}
                selectedUsers={selectedUsers}
                onSelectionChange={setSelectedUsers}
            />
        </>
    );
};

export default AddPromotionalBanner;
