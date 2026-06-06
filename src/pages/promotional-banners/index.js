"use client";

import { useState, useEffect } from "react";
import { Grid, Card, Typography, TextField, Button, Snackbar, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, IconButton, Chip } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/router";
import moment from "moment";

const PromotionalBanners = () => {
    const [banners, setBanners] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const accessToken = localStorage.getItem("access_token");
            setToken(accessToken);
            if (accessToken) {
                fetchBanners(accessToken);
            } else {
                setErrorMessage("Access token not found. Please log in again.");
            }
        }
    }, []);

    const fetchBanners = async (accessToken) => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/promotional-banners`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: accessToken,
                },
            });

            const result = await res.json();
            if (res.ok && result.success) {
                setBanners(result.data);
            } else {
                setErrorMessage(result.message || "Failed to load banners.");
            }
        } catch (error) {
            console.error("Error fetching banners:", error);
            setErrorMessage("Error fetching promotional banners.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this banner?")) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/promotional-banners/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: token,
                },
            });

            const result = await res.json();
            if (res.ok && result.success) {
                setSuccessMessage("Banner deleted successfully.");
                fetchBanners(token);
            } else {
                setErrorMessage(result.message || "Failed to delete banner.");
            }
        } catch (error) {
            console.error("Error deleting banner:", error);
            setErrorMessage("Error deleting promotional banner.");
        }
    };

    const handleEdit = (id) => {
        router.push(`/promotional-banners/add-banner?id=${id}`);
    };

    const handleAddNew = () => {
        router.push(`/promotional-banners/add-banner`);
    };

    const handleCloseSnackbar = () => {
        setErrorMessage("");
        setSuccessMessage("");
    };

    return (
        <Grid container spacing={4}>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                    Promotional Banners
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddNew}
                    sx={{ backgroundColor: "#1976d2", "&:hover": { backgroundColor: "#1565c0" } }}
                >
                    Add Banner
                </Button>
            </Grid>

            <Grid item xs={12}>
                <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
                    <Table>
                        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableRow>
                                <TableCell><b>Image</b></TableCell>
                                <TableCell><b>Title</b></TableCell>
                                <TableCell><b>Audience</b></TableCell>
                                <TableCell><b>Display Type</b></TableCell>
                                <TableCell><b>Priority</b></TableCell>
                                <TableCell><b>Status</b></TableCell>
                                <TableCell><b>Start Time</b></TableCell>
                                <TableCell><b>End Time</b></TableCell>
                                <TableCell><b>View Time</b></TableCell>
                                <TableCell align="center"><b>Actions</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && banners.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">Loading banners...</TableCell>
                                </TableRow>
                            ) : banners.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>
                                        {row.image_url ? (
                                            <img src={row.image_url} alt={row.title} style={{ width: '80px', height: 'auto', borderRadius: '4px' }} />
                                        ) : 'No Image'}
                                    </TableCell>
                                    <TableCell>{row.title}</TableCell>
                                    <TableCell sx={{ textTransform: 'capitalize' }}>{row.audience_type}</TableCell>
                                    <TableCell sx={{ textTransform: 'capitalize' }}>{row.display_type}</TableCell>
                                    <TableCell>{row.priority}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={row.status === 1 ? 'Active' : 'Inactive'} 
                                            color={row.status === 1 ? 'success' : 'default'} 
                                            size="small" 
                                        />
                                    </TableCell>
                                    <TableCell>{moment(row.start_time).format('YYYY-MM-DD HH:mm')}</TableCell>
                                    <TableCell>{row.end_time ? moment(row.end_time).format('YYYY-MM-DD HH:mm') : 'No End Time'}</TableCell>
                                    <TableCell>{row.view_time ? moment(row.view_time).format('hh:mm A') : 'No View Time'}</TableCell>
                                    <TableCell align="center">
                                        <IconButton color="primary" onClick={() => handleEdit(row.id)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton color="error" onClick={() => handleDelete(row.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!loading && banners.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        No promotional banners found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>

            <Snackbar
                open={!!errorMessage}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <MuiAlert elevation={6} variant="filled" severity="error">
                    {errorMessage}
                </MuiAlert>
            </Snackbar>

            <Snackbar
                open={!!successMessage}
                autoHideDuration={4000}
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

export default PromotionalBanners;
