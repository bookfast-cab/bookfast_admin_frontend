"use client";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import {
  Button,
  SvgIcon,
  TextField,
  Tooltip,
  IconButton,
  Avatar,
  Switch,
} from "@mui/material";
import CommonDataTable from "src/components/CommonDataTable";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

// Plus icon dynamic import
const PlusIcon = dynamic(
  () => import("@heroicons/react/24/solid/PlusIcon"),
  { ssr: false }
);

const StaffTable = () => {
  const [data, setData] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [token, setToken] = useState(null);
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("access_token"));
    }
  }, []);

  useEffect(() => {
    if (token) {
      getStaffs(0, perPage);
    }
  }, [token, searchText]);

  const handleSearchClick = () => {
    getStaffs(1, perPage);
  };

  const handleCloseSnackbar = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Fetch Staff data
  const getStaffs = (page_num, perPage = 10) => {
    if (!token) return;

    const queryParams = new URLSearchParams({
      page: page_num,
      perPage,
      search: searchText,
    }).toString();

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/staff?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch staff. Status: ${response.status}`);
        }

        return response.json();
      })
      .then((result) => {
        setData(result.data || []);
        setTotalRecords(result.totalRecords || 0);
        setTotalPages(result.totalPages || 0);
        setCurrentPage(result.currentPage || 1);
        setPerPage(result.perPage || 10);
      })
      .catch((error) => {
        setErrorMessage("Failed to fetch staff data.");
        console.error(error);
      });
  };

  const handleEdit = (id) => {
    router.push(`/staff/edit?id=${id}`);
  };

  const handleShow = (id) => {
    router.push(`/staff/show?id=${id}`);
  };

  const handleDelete = (id) => {
    // TODO: Delete logic with confirmation
  };

  const handleToggle = async (id, value) => {
    console.log("Toggle Active", id, value);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/updateStaffStatus/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ is_active: value ? "yes" : "no" }), // convert true/false → yes/no
        }
      );

      const data = await response.json();

      if (data.success) {

        console.log("✅ Status updated successfully");
        
        // update local state
        setData(prev =>
          prev.map(staff =>
            staff.id === id ? { ...staff, is_active: value ? "yes" : "no" } : staff
          )
        );
      } else {
        console.error("❌ Failed to update status:", data.message);
      }
    } catch (err) {
      console.error("⚠️ Error updating status:", err);
    }
  };



  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
    },
    {
      field: "avatar",
      headerName: "Avatar",
      width: 100,
      renderCell: (params) => (
        <Avatar
          src={params.row.avatar || ""}
          alt={params.row.name}
          sx={{ width: 40, height: 40 }}
        />
      ),
    },
    {
      field: "name",
      headerName: "Full Name",
      width: 150,
    },
    {
      field: "username",
      headerName: "Username",
      width: 150,
    },
    {
      field: "email",
      headerName: "Email",
      width: 200,
    },
    {
      field: "userRole",
      headerName: "Role",
      width: 120,
    },
    {
      field: "is_active",
      headerName: "Active",
      width: 120,
      renderCell: (params) => (
        params.row.userRole === "staff" ? (
          <Switch
            checked={params.row.is_active === "yes"}
            onChange={(e) => handleToggle(params.row.id, e.target.checked)}
            color="success"
          />
        ) : (
          "-" // show dash if not staff, or you can return null
        )
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        params.row.userRole === "staff" ? (
          <>
            {/* <Tooltip title="Edit" arrow>
              <IconButton onClick={() => handleEdit(params.row.id)}>
                <EditIcon sx={{ color: "#1976d2" }} />
              </IconButton>
            </Tooltip> */}

            {/* <Tooltip title="View" arrow>
              <IconButton onClick={() => handleShow(params.row.id)}>
                <VisibilityIcon sx={{ color: "#2e7d32" }} />
              </IconButton>
            </Tooltip> */}

            {/* <Tooltip title="Delete" arrow>
              <IconButton onClick={() => handleDelete(params.row.id)}>
                <DeleteIcon sx={{ color: "red" }} />
              </IconButton>
            </Tooltip> */}
          </>
        ) : null
      ),
    },
  ];


  return (
    <Grid container spacing={4} sx={{ bgcolor: "white", padding: 3 }}>
      <Grid item xs={12}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1976d2" }}>
              Staff Management
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: "right" }}>
            <Button
              startIcon={
                <SvgIcon fontSize="small">
                  <PlusIcon />
                </SvgIcon>
              }
              variant="contained"
              onClick={() => router.push("/staff/addStaff")}
              sx={{
                backgroundColor: "#1976d2",
                "&:hover": { backgroundColor: "#1565c0" },
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              Add Staff
            </Button>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
          {/* Search Box */}
          <div
            style={{
              padding: "16px",
              borderBottom: "1px solid #e0e0e0",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Search:
            </Typography>
            <TextField
              id="search-field"
              variant="outlined"
              size="small"
              placeholder="Search staff..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{
                width: "300px",
                "& .MuiOutlinedInput-root": { borderRadius: "8px" },
              }}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSearchClick}>
                    <SearchIcon />
                  </IconButton>
                ),
              }}
            />
          </div>

          {/* Table */}
          <div style={{ width: "100%", overflowX: "auto" }}>
            <CommonDataTable
              columns={columns}
              items={data}
              totalRecords={totalRecords}
              totalPages={totalPages}
              currentPage={currentPage}
              rowsPerPage={perPage}
              onPageChange={getStaffs}
            />
          </div>
        </Card>
      </Grid>

      {/* Snackbars */}
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

export default StaffTable;
