"use client";

import { useState, useEffect } from "react";
import { Grid, Card, Typography, TextField, Button, Snackbar, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const SupportNumbers = () => {
    const [supportNumbers, setSupportNumbers] = useState([]);
    const [newNumber, setNewNumber] = useState("");

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editNumber, setEditNumber] = useState("");

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const accessToken = localStorage.getItem("access_token");
            setToken(accessToken);
            if (accessToken) {
                fetchSupportNumbers(accessToken);
            } else {
                setErrorMessage("Access token not found. Please log in again.");
            }
        }
    }, []);

    const fetchSupportNumbers = async (accessToken) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/support-numbers`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: accessToken,
                },
            });

            const result = await res.json();
            if (res.ok) {
                setSupportNumbers(result);
            } else {
                setErrorMessage(result.error || "Failed to load support numbers.");
            }
        } catch (error) {
            console.error("Error fetching support numbers:", error);
            setErrorMessage("Error fetching support numbers.");
        }
    };

    const handleAdd = async () => {
        if (!newNumber.trim()) {
            setErrorMessage("Phone number cannot be empty.");

            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/support-numbers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({ phone_number: newNumber }),
            });

            const result = await res.json();
            if (res.ok) {
                setSuccessMessage("Support number added successfully.");
                setNewNumber("");
                fetchSupportNumbers(token);
            } else {
                setErrorMessage(result.error || "Failed to add support number.");
            }
        } catch (error) {
            console.error("Error adding support number:", error);
            setErrorMessage("Error adding support number.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this number?")) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/support-numbers/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: token,
                },
            });

            if (res.ok) {
                setSuccessMessage("Support number deleted successfully.");
                fetchSupportNumbers(token);
            } else {
                const result = await res.json();
                setErrorMessage(result.error || "Failed to delete support number.");
            }
        } catch (error) {
            console.error("Error deleting support number:", error);
            setErrorMessage("Error deleting support number.");
        }
    };

    const openEditDialog = (item) => {
        setEditId(item.id);
        setEditNumber(item.phone_number);
        setEditDialogOpen(true);
    };

    const closeEditDialog = () => {
        setEditDialogOpen(false);
        setEditId(null);
        setEditNumber("");
    };

    const handleEditSave = async () => {
        if (!editNumber.trim()) {
            setErrorMessage("Phone number cannot be empty.");
            
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/support-numbers/${editId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                },
                body: JSON.stringify({ phone_number: editNumber }),
            });

            if (res.ok) {
                setSuccessMessage("Support number updated successfully.");
                closeEditDialog();
                fetchSupportNumbers(token);
            } else {
                const result = await res.json();
                setErrorMessage(result.error || "Failed to update support number.");
            }
        } catch (error) {
            console.error("Error updating support number:", error);
            setErrorMessage("Error updating support number.");
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
                    Support Numbers Management
                </Typography>
            </Grid>

            <Grid item xs={12}>
                <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
                        Add New Support Number
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={8}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                variant="outlined"
                                value={newNumber}
                                onChange={(e) => setNewNumber(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: "#1976d2",
                                    "&:hover": { backgroundColor: "#1565c0" },
                                    textTransform: "none",
                                    fontWeight: "bold",
                                    height: "56px"
                                }}
                                onClick={handleAdd}
                                disabled={loading}
                                fullWidth
                            >
                                {loading ? "Adding..." : "Add Number"}
                            </Button>
                        </Grid>
                    </Grid>
                </Card>
            </Grid>

            <Grid item xs={12}>
                <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
                    <Table>
                        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                            <TableRow>
                                <TableCell><b>ID</b></TableCell>
                                <TableCell><b>Phone Number</b></TableCell>
                                <TableCell align="center"><b>Actions</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {supportNumbers.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.id}</TableCell>
                                    <TableCell>{row.phone_number}</TableCell>
                                    <TableCell align="center">
                                        <IconButton color="primary" onClick={() => openEditDialog(row)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton color="error" onClick={() => handleDelete(row.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {supportNumbers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        No support numbers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={closeEditDialog}>
                <DialogTitle>Edit Support Number</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Phone Number"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={editNumber}
                        onChange={(e) => setEditNumber(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeEditDialog}>Cancel</Button>
                    <Button onClick={handleEditSave} variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

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

export default SupportNumbers;
