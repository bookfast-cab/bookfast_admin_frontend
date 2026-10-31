import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Chip,
  Box,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocationCityIcon from '@mui/icons-material/LocationCity';

const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

const LOCATION_TYPES = ['city', 'district', 'tehsil', 'subdistrict', 'town'];

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const initialFormState = {
  city_name: '',
  slug: '',
  location_type: 'city',
  parent_district: '',
  state: '',
  country: 'India',
  latitude: '',
  longitude: '',
  status: 1,
  is_city_page_enabled: 1,
  is_route_enabled: 1,
};

const CityMasterListPage = () => {
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0); // 0-indexed for TablePagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  // Delete Dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [cityToDelete, setCityToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Export Loading
  const [exporting, setExporting] = useState(false);

  // Toast Feedback
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }

    return null;
  };

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast(prev => ({ ...prev, open: false }));
  };

  // Fetch City Master List
  const fetchCities = useCallback(async (pageIndex = page, limit = rowsPerPage) => {
    setLoading(true);
    try {
      const token = getToken();

      const queryParams = new URLSearchParams({
        page: pageIndex + 1,
        perPage: limit,
        search: search.trim(),
        state: filterState,
        location_type: filterType,
        status: filterStatus,
      }).toString();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/city-masterlist?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      });

      const result = await res.json();
      if (result.success) {
        setData(result.data || []);
        setTotalRecords(result.totalRecords || 0);
      } else {
        showToast(result.message || 'Failed to fetch cities', 'error');
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      showToast('Error connecting to server', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, filterState, filterType, filterStatus]);

  useEffect(() => {
    fetchCities(page, rowsPerPage);
  }, [page, rowsPerPage, filterState, filterType, filterStatus]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setPage(0);
    fetchCities(0, rowsPerPage);
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilterState('');
    setFilterType('');
    setFilterStatus('');
    setPage(0);
  };

  // Toggle Field handler (status, is_city_page_enabled, is_route_enabled)
  const handleToggle = async (id, field, currentValue) => {
    const newValue = currentValue ? 0 : 1;

    // Optimistic update
    setData(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: newValue } : item))
    );

    try {
      const token = getToken();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/city-masterlist/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        body: JSON.stringify({ field, value: newValue }),
      });
      const result = await res.json();
      if (!result.success) {
        // Rollback on failure
        setData(prev =>
          prev.map(item => (item.id === id ? { ...item, [field]: currentValue } : item))
        );
        showToast(result.message || 'Toggle update failed', 'error');
      }
    } catch (error) {
      setData(prev =>
        prev.map(item => (item.id === id ? { ...item, [field]: currentValue } : item))
      );
      showToast('Error updating toggle', 'error');
    }
  };

  // Open Add Dialog
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setAutoSlug(true);
    setOpenDialog(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (city) => {
    setEditingId(city.id);
    setFormData({
      city_name: city.city_name || '',
      slug: city.slug || '',
      location_type: city.location_type || 'city',
      parent_district: city.parent_district || '',
      state: city.state || '',
      country: city.country || 'India',
      latitude: city.latitude !== null && city.latitude !== undefined ? city.latitude : '',
      longitude: city.longitude !== null && city.longitude !== undefined ? city.longitude : '',
      status: city.status ? 1 : 0,
      is_city_page_enabled: city.is_city_page_enabled ? 1 : 0,
      is_route_enabled: city.is_route_enabled ? 1 : 0,
    });
    setAutoSlug(false);
    setOpenDialog(true);
  };

  // Form input changes
  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked ? 1 : 0 }));
    } else if (name === 'city_name') {
      setFormData(prev => ({
        ...prev,
        city_name: value,
        slug: autoSlug ? slugify(value) : prev.slug,
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Form Submission
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.city_name.trim()) {
      showToast('City Name is required', 'error');

      return;
    }

    setIsSubmitting(true);
    try {
      const token = getToken();

      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/city-masterlist/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/city-masterlist`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (result.success) {
        showToast(result.message || (editingId ? 'City updated successfully!' : 'City created successfully!'));
        setOpenDialog(false);
        fetchCities(page, rowsPerPage);
      } else {
        showToast(result.message || 'Operation failed', 'error');
      }
    } catch (error) {
      console.error('Error submitting city:', error);
      showToast('Error saving city record', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete confirmation
  const handleOpenDelete = (city) => {
    setCityToDelete(city);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!cityToDelete) return;
    setIsDeleting(true);
    try {
      const token = getToken();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/city-masterlist/${cityToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      });

      const result = await res.json();
      if (result.success) {
        showToast('City deleted successfully!');
        setOpenDeleteDialog(false);
        setCityToDelete(null);
        fetchCities(page, rowsPerPage);
      } else {
        showToast(result.message || 'Failed to delete city', 'error');
      }
    } catch (error) {
      console.error('Error deleting city:', error);
      showToast('Error deleting city', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Export to CSV
  const handleExport = async () => {
    setExporting(true);
    try {
      const token = getToken();

      const queryParams = new URLSearchParams({
        search: search.trim(),
        state: filterState,
        location_type: filterType,
      }).toString();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/export-city-masterlist?${queryParams}`, {
        method: 'GET',
        headers: {
          Authorization: `${token}`,
        },
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `city_masterlist_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('Export downloaded successfully!');
    } catch (error) {
      console.error('Error exporting city masterlist:', error);
      showToast('Failed to export data', 'error');
    } finally {
      setExporting(false);
    }
  };

  const getLocationTypeColor = (type) => {
    switch (type) {
      case 'district':
        return 'primary';
      case 'city':
        return 'success';
      case 'tehsil':
      case 'subdistrict':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Grid container spacing={6}>
      {/* Page Header */}
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LocationCityIcon color="primary" sx={{ fontSize: 32 }} />
            <div>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                City Master List
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage master list of cities, slugs, location types, coordinates, and page/route flags
              </Typography>
            </div>
            <Chip
              label={`${totalRecords} Cities`}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={exporting ? <CircularProgress size={16} /> : <FileDownloadIcon />}
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? 'Exporting...' : 'Export CSV'}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAdd}
            >
              Add City
            </Button>
          </Box>
        </Box>
      </Grid>

      {/* Filter and Search Bar */}
      <Grid item xs={12}>
        <Card sx={{ p: 2 }}>
          <form onSubmit={handleSearchSubmit}>
            <Grid container spacing={3} alignItems="center">
              {/* Search text */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search City / Slug / District"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. Amritsar, Punjab"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* State Filter */}
              <Grid item xs={12} sm={6} md={2.5}>
                <FormControl fullWidth size="small">
                  <InputLabel id="filter-state-label">State</InputLabel>
                  <Select
                    labelId="filter-state-label"
                    value={filterState}
                    label="State"
                    onChange={(e) => {
                      setFilterState(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="">All States</MenuItem>
                    {INDIAN_STATES.map((st) => (
                      <MenuItem key={st} value={st}>
                        {st}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Location Type Filter */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel id="filter-type-label">Location Type</InputLabel>
                  <Select
                    labelId="filter-type-label"
                    value={filterType}
                    label="Location Type"
                    onChange={(e) => {
                      setFilterType(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    {LOCATION_TYPES.map((lt) => (
                      <MenuItem key={lt} value={lt}>
                        {lt.toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Status Filter */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel id="filter-status-label">Status</InputLabel>
                  <Select
                    labelId="filter-status-label"
                    value={filterStatus}
                    label="Status"
                    onChange={(e) => {
                      setFilterStatus(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="1">Active</MenuItem>
                    <MenuItem value="0">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Actions: Search & Reset */}
              <Grid item xs={12} md={2.5} sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" color="primary" type="submit" fullWidth>
                  Search
                </Button>
                <Tooltip title="Reset Filters">
                  <IconButton onClick={handleResetFilters} color="secondary" sx={{ border: '1px solid #e2e8f0' }}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </form>
        </Card>
      </Grid>

      {/* City Master Table */}
      <Grid item xs={12}>
        <Card>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 950 }} aria-label="City Master Table">
              <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>City Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Slug</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Parent District</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>State</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Country</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Coordinates</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>City Page</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Route</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={36} />
                      <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>
                        Loading cities...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">
                        No cities found matching the criteria.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ fontWeight: 'bold', color: 'text.secondary' }}>#{row.id}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.city_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.slug || 'N/A'}
                          size="small"
                          variant="outlined"
                          sx={{ fontFamily: 'monospace', fontSize: '11px' }}
                        />
                      </TableCell>
                      <TableCell>
                        {row.location_type ? (
                          <Chip
                            label={row.location_type}
                            size="small"
                            color={getLocationTypeColor(row.location_type)}
                            variant="filled"
                            sx={{ textTransform: 'capitalize', fontWeight: 500 }}
                          />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{row.parent_district || '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{row.state || '-'}</TableCell>
                      <TableCell>{row.country || 'India'}</TableCell>
                      <TableCell>
                        {row.latitude && row.longitude ? (
                          <Tooltip title={`Lat: ${row.latitude}, Lng: ${row.longitude}`}>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                              {parseFloat(row.latitude).toFixed(4)}, {parseFloat(row.longitude).toFixed(4)}
                            </Typography>
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            Not Set
                          </Typography>
                        )}
                      </TableCell>

                      {/* Status Toggle */}
                      <TableCell align="center">
                        <Switch
                          size="small"
                          checked={Boolean(row.status)}
                          onChange={() => handleToggle(row.id, 'status', row.status)}
                          color="success"
                        />
                      </TableCell>

                      {/* City Page Toggle */}
                      <TableCell align="center">
                        <Switch
                          size="small"
                          checked={Boolean(row.is_city_page_enabled)}
                          onChange={() => handleToggle(row.id, 'is_city_page_enabled', row.is_city_page_enabled)}
                          color="primary"
                        />
                      </TableCell>

                      {/* Route Enabled Toggle */}
                      <TableCell align="center">
                        <Switch
                          size="small"
                          checked={Boolean(row.is_route_enabled)}
                          onChange={() => handleToggle(row.id, 'is_route_enabled', row.is_route_enabled)}
                          color="info"
                        />
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                          <Tooltip title="Edit City">
                            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(row)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete City">
                            <IconButton size="small" color="error" onClick={() => handleOpenDelete(row)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={totalRecords}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Card>
      </Grid>

      {/* Add / Edit City Dialog */}
      <Dialog open={openDialog} onClose={() => !isSubmitting && setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingId ? `Edit City (#${editingId})` : 'Add New City to Master List'}
        </DialogTitle>

        <form onSubmit={handleSubmitForm}>
          <DialogContent dividers>
            <Grid container spacing={3}>
              {/* City Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="City Name"
                  name="city_name"
                  value={formData.city_name}
                  onChange={handleInputChange}
                  placeholder="e.g. Ludhiana"
                />
              </Grid>

              {/* Slug */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="e.g. ludhiana"
                  helperText="URL friendly identifier"
                />
              </Grid>

              {/* Location Type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="dialog-location-type-label">Location Type</InputLabel>
                  <Select
                    labelId="dialog-location-type-label"
                    name="location_type"
                    value={formData.location_type}
                    label="Location Type"
                    onChange={handleInputChange}
                  >
                    {LOCATION_TYPES.map((lt) => (
                      <MenuItem key={lt} value={lt}>
                        {lt.toUpperCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Parent District */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Parent District"
                  name="parent_district"
                  value={formData.parent_district}
                  onChange={handleInputChange}
                  placeholder="e.g. Ludhiana"
                />
              </Grid>

              {/* State */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="dialog-state-label">State</InputLabel>
                  <Select
                    labelId="dialog-state-label"
                    name="state"
                    value={formData.state}
                    label="State"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">Select State</MenuItem>
                    {INDIAN_STATES.map((st) => (
                      <MenuItem key={st} value={st}>
                        {st}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Country */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="India"
                />
              </Grid>

              {/* Latitude */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  inputProps={{ step: 'any' }}
                  label="Latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  placeholder="e.g. 30.9010"
                />
              </Grid>

              {/* Longitude */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  inputProps={{ step: 'any' }}
                  label="Longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  placeholder="e.g. 75.8573"
                />
              </Grid>

              {/* Toggles */}
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: '#f8fafc',
                    borderRadius: 2,
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 3,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(formData.status)}
                        name="status"
                        onChange={handleInputChange}
                        color="success"
                      />
                    }
                    label="Status (Active)"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(formData.is_city_page_enabled)}
                        name="is_city_page_enabled"
                        onChange={handleInputChange}
                        color="primary"
                      />
                    }
                    label="Is City Page Enabled"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(formData.is_route_enabled)}
                        name="is_route_enabled"
                        onChange={handleInputChange}
                        color="info"
                      />
                    }
                    label="Is Route Enabled"
                  />
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setOpenDialog(false)} color="secondary" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <CircularProgress size={22} color="inherit" />
              ) : editingId ? (
                'Save Changes'
              ) : (
                'Create City'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => !isDeleting && setOpenDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete <strong>{cityToDelete?.city_name}</strong>?
          </Typography>
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} color="secondary" disabled={isDeleting}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error" disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={22} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default CityMasterListPage;
