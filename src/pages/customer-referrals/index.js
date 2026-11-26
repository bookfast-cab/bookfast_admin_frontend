"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Box,
  Snackbar,
  IconButton,
  Tooltip,
  InputAdornment,
  Drawer,
  Divider,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CommonDataTable from "src/components/CommonDataTable";

const CustomerReferralsPage = () => {
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({ totalReferrals: 0, totalRewardDistributed: 0 });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("access_token");
      setToken(accessToken);
    }
  }, []);

  const fetchReferrals = useCallback(
    async (page = 1, limit = 10) => {
      const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);
      if (!activeToken) return;

      try {
        const queryParams = new URLSearchParams({
          page: String(page),
          perPage: String(limit),
          search: searchText,
          status: statusFilter
        }).toString();

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customer-referrals?${queryParams}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${activeToken}`
            }
          }
        );

        const result = await res.json();
        if (result.success) {
          setData(result.data || []);
          setTotalRecords(result.totalRecords || 0);
          setTotalPages(result.totalPages || 1);
          setCurrentPage(result.currentPage || 1);
          setPerPage(result.perPage || 10);
          if (result.stats) {
            setStats(result.stats);
          }
        } else {
          setErrorMessage(result.message || "Failed to fetch customer referrals");
        }
      } catch (err) {
        console.error("Error fetching referrals:", err);
        setErrorMessage("Error fetching customer referrals");
      }
    },
    [token, searchText, statusFilter]
  );

  useEffect(() => {
    if (token) {
      fetchReferrals(1, perPage);
    }
  }, [token, searchText, statusFilter, fetchReferrals, perPage]);

  const handlePageChange = (zeroBasedPage, newPageSize) => {
    const pageNum = zeroBasedPage + 1;
    fetchReferrals(pageNum, newPageSize || perPage);
  };

  const handleViewDetails = (row) => {
    setSelectedRow(row);
    setDrawerOpen(true);
  };

  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 80
    },
    {
      field: "referralCode",
      headerName: "Referral Code",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.row.referralCode || "N/A"}
          size="small"
          sx={{
            fontWeight: 700,
            backgroundColor: "#fff3e0",
            color: "#e65100",
            border: "1px solid #ffe0b2",
            letterSpacing: 0.5
          }}
        />
      )
    },
    {
      field: "referrer",
      headerName: "Referrer (Shared By)",
      width: 240,
      renderCell: (params) => {
        const ref = params.row.referrer;
        if (!ref) return <span>N/A</span>;
        
return (
          <Box sx={{ display: "flex", flexDirection: "column", py: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#1976d2" }}>
                {ref.name || "Customer #" + ref.id}
              </Typography>
              {ref.id ? (
                <Chip
                  label={`ID: ${ref.id}`}
                  size="small"
                  sx={{ height: 18, fontSize: "0.68rem", fontWeight: 700, bgcolor: "#e3f2fd", color: "#1976d2" }}
                />
              ) : null}
            </Box>
            <Typography variant="caption" color="textSecondary">
              📱 {ref.phoneNumber || "No phone"}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: "referred",
      headerName: "Referred Customer (New User)",
      width: 240,
      renderCell: (params) => {
        const ref = params.row.referred;
        if (!ref) return <span>N/A</span>;
        
return (
          <Box sx={{ display: "flex", flexDirection: "column", py: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {ref.name || "Customer #" + ref.id}
              </Typography>
              {ref.id ? (
                <Chip
                  label={`ID: ${ref.id}`}
                  size="small"
                  sx={{ height: 18, fontSize: "0.68rem", fontWeight: 700, bgcolor: "#f5f5f5", color: "#555" }}
                />
              ) : null}
            </Box>
            <Typography variant="caption" color="textSecondary">
              📱 {ref.phoneNumber || "No phone"}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: "amount",
      headerName: "Reward Amount",
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: "#2e7d32" }}>
          ₹{params.row.amount ?? 0}
        </Typography>
      )
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params) => {
        const status = (params.row.status || "completed").toLowerCase();
        let color = "success";
        let label = "Completed";

        if (status === "pending") {
          color = "warning";
          label = "Pending Ride";
        } else if (status === "credited") {
          color = "success";
          label = "Credited";
        }

        return <Chip label={label} color={color} size="small" variant="filled" />;
      }
    },
    {
      field: "created_at",
      headerName: "Date & Time",
      width: 180,
      renderCell: (params) => {
        if (!params.row.created_at) return <span>-</span>;
        const d = new Date(params.row.created_at);
        
return <span>{d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>;
      }
    },
    {
      field: "actions",
      headerName: "Action",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="View Details" arrow>
          <IconButton
            size="small"
            onClick={() => handleViewDetails(params.row)}
            sx={{
              backgroundColor: "#f5f5f5",
              "&:hover": { backgroundColor: "#e0e0e0" }
            }}
          >
            <VisibilityIcon fontSize="small" sx={{ color: "#1976d2" }} />
          </IconButton>
        </Tooltip>
      )
    }
  ];

  return (
    <Grid container spacing={3}>
      {/* Title & Stats */}
      <Grid item xs={12}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <div>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Customer Referral History
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Track which customers invited new users, referral codes used, and rewards earned.
            </Typography>
          </div>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchReferrals(currentPage, perPage)}
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
        </Box>
      </Grid>

      {/* Metric Cards */}
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ borderRadius: 2, boxShadow: 1, p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "#e3f2fd", color: "#1976d2", width: 48, height: 48 }}>
              <PeopleAltIcon />
            </Avatar>
            <div>
              <Typography variant="caption" color="textSecondary">
                TOTAL REFERRALS
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {stats.totalReferrals}
              </Typography>
            </div>
          </Box>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ borderRadius: 2, boxShadow: 1, p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", width: 48, height: 48 }}>
              <AccountBalanceWalletIcon />
            </Avatar>
            <div>
              <Typography variant="caption" color="textSecondary">
                TOTAL REWARDS DISTRIBUTED
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#2e7d32" }}>
                ₹{stats.totalRewardDistributed}
              </Typography>
            </div>
          </Box>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ borderRadius: 2, boxShadow: 1, p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "#fff3e0", color: "#e65100", width: 48, height: 48 }}>
              <CardGiftcardIcon />
            </Avatar>
            <div>
              <Typography variant="caption" color="textSecondary">
                CURRENT PAGE RECORDS
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {data.length} of {totalRecords}
              </Typography>
            </div>
          </Box>
        </Card>
      </Grid>

      {/* Filter and Search Bar */}
      <Grid item xs={12}>
        <Card sx={{ borderRadius: 2, boxShadow: 1, p: 2 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
            <TextField
              size="small"
              placeholder="Search by mobile no, customer ID, referral code, or name..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ minWidth: 360, flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="credited">Credited</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Card>
      </Grid>

      {/* Data Table */}
      <Grid item xs={12}>
        <Card sx={{ borderRadius: 2, boxShadow: 2, overflow: "hidden" }}>
          <CommonDataTable
            columns={columns}
            items={data}
            totalRecords={totalRecords}
            totalPages={totalPages}
            currentPage={currentPage - 1}
            rowsPerPage={perPage}
            onPageChange={handlePageChange}
          />
        </Card>
      </Grid>

      {/* Details Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 420 }, p: 3 } }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Referral Details
          </Typography>
          <IconButton size="small" onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {selectedRow && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box sx={{ p: 2, backgroundColor: "#fafafa", borderRadius: 2, border: "1px solid #e0e0e0" }}>
              <Typography variant="caption" color="textSecondary">
                REFERRAL CODE
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#ff7700", letterSpacing: 1 }}>
                {selectedRow.referralCode}
              </Typography>
              <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="textSecondary">
                  Reward Amount:
                </Typography>
                <Typography variant="subtitle1" fontWeight={700} color="#2e7d32">
                  ₹{selectedRow.amount}
                </Typography>
              </Box>
              <Box sx={{ mt: 0.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="textSecondary">
                  Status:
                </Typography>
                <Chip label={selectedRow.status || "Completed"} color="success" size="small" />
              </Box>
            </Box>

            {/* Referrer Details */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1976d2", mb: 1 }}>
                Referrer (Invited By)
              </Typography>
              <Box sx={{ p: 2, backgroundColor: "#f0f7ff", borderRadius: 2, borderLeft: "4px solid #1976d2" }}>
                <Typography variant="body2" fontWeight={600}>
                  {selectedRow.referrer?.name || "N/A"}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  Customer ID: #{selectedRow.referrer?.id}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  📱 Phone: {selectedRow.referrer?.phoneNumber || "N/A"}
                </Typography>
                <Typography variant="body2">
                  ✉️ Email: {selectedRow.referrer?.email || "N/A"}
                </Typography>
              </Box>
            </Box>

            {/* Referred Customer Details */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#2e7d32", mb: 1 }}>
                Referred User (New Customer)
              </Typography>
              <Box sx={{ p: 2, backgroundColor: "#f1f8e9", borderRadius: 2, borderLeft: "4px solid #2e7d32" }}>
                <Typography variant="body2" fontWeight={600}>
                  {selectedRow.referred?.name || "N/A"}
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block">
                  Customer ID: #{selectedRow.referred?.id}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  📱 Phone: {selectedRow.referred?.phoneNumber || "N/A"}
                </Typography>
                <Typography variant="body2">
                  ✉️ Email: {selectedRow.referred?.email || "N/A"}
                </Typography>
              </Box>
            </Box>

            {/* Timestamps */}
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="textSecondary" display="block">
                Registered / Applied At:
              </Typography>
              <Typography variant="body2">
                {selectedRow.created_at ? new Date(selectedRow.created_at).toLocaleString() : "N/A"}
              </Typography>
            </Box>
          </Box>
        )}
      </Drawer>

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

export default CustomerReferralsPage;
