// ** MUI Imports
import {
  Drawer,
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  Button,
  Stack
} from "@mui/material";
import { useState, useEffect } from "react";

const DriverSearchDrawer = ({ open, onClose, onSelectDriver }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [driverList, setDriverList] = useState([]);
  const [token, setToken] = useState("");
  const [page, setPage] = useState(1);

  const perPage = 10;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("access_token") || "");
    }
  }, []);

  // Fetch driver list from API
  const fetchDrivers = async (pageNumber = page, filterText = searchTerm) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/drivers?page=${pageNumber}&perPage=${perPage}&type=undefined&search=${filterText}&sort=DESC&sortColumn=id`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token
          }
        }
      );

      const result = await response.json();

      if (result.success) {
        setDriverList(result.data || []);
      }
    } catch (error) {
      console.error("Driver List Fetch Error:", error);
    }
  };

  // Auto load when drawer opens
  useEffect(() => {
    if (open) {
      setPage(1);
      fetchDrivers(1, "");
    }
  }, [open, token]);

  const handleSearch = text => {
    setSearchTerm(text);
    fetchDrivers(1, text);
  };

  const handlePagination = newPage => {
    if (newPage < 1) return;
    setPage(newPage);
    fetchDrivers(newPage, searchTerm);
  };

  const handleSelect = driver => {
    onSelectDriver(driver);
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 450, p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Select Driver
        </Typography>

        {/* pagination above */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            disabled={page === 1}
            onClick={() => handlePagination(page - 1)}
          >
            Prev
          </Button>
          <Typography sx={{ mt: 1 }}>Page: {page}</Typography>
          <Button
            variant="outlined"
            onClick={() => handlePagination(page + 1)}
          >
            Next
          </Button>
        </Stack>

        <TextField
          fullWidth
          placeholder="Search by name or phone"
          value={searchTerm}
          onChange={e => handleSearch(e.target.value)}
        />

        <List sx={{ mt: 2 }}>
          {driverList.map(driver => (
            <Box key={driver.id}>
              <ListItem button onClick={() => handleSelect(driver)}>
                <ListItemAvatar>
                  <Avatar
                    src={driver.driverProfile || "/no-user.png"}
                    alt={driver.driverName || "Driver"}
                  />
                </ListItemAvatar>

                <ListItemText
                  primary={driver.driverName || driver.phone_number}
                  secondary={driver.email || driver.phone_number}
                />
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default DriverSearchDrawer;
