import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { Button, FormControl, IconButton, InputLabel, Menu, MenuItem, Select, SvgIcon, Dialog, DialogTitle, DialogContent, DialogActions, Box, CircularProgress } from '@mui/material'
import TextField from '@mui/material/TextField';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import TableBasic from 'src/views/tables/TripsTable'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import CommonDataTable from 'src/components/CommonDataTable';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { formatDate } from 'src/utils/utils';
import TripDrawer from '../pages/trips/TripDrawer'; // Adjusted import path
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Info } from '@mui/icons-material';
import ExportButton from './export';
import { Map } from 'mdi-material-ui';

const TripListContainer = ({ isFromAdmin, showAddButton, title = "Trips" }) => {

    const [data, setData] = useState([])
    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(0);
    const [vehicleList, setVehicleList] = useState([]);

    const [loadingExport, setLoadingExport] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(null);

    const [mapModalOpen, setMapModalOpen] = useState(false);
    const [mapImage, setMapImage] = useState('');
    const [loadingMapTripId, setLoadingMapTripId] = useState(null);
    const [selectedTripForMap, setSelectedTripForMap] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);


    let token
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('access_token')
    }
    const router = useRouter();
    const { type, date_type } = router.query;

    const handleCloseSnackbar = () => {
        setErrorMessage('')
        setSuccessMessage('')
    }

    useEffect(() => {
        if (type) setSelectedStatus(type)
    }, [type]);

    useEffect(() => {
        getoutstationConfig();
    }, []);

    const getoutstationConfig = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/outstation-packageConfig`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch data. Status: ${response.status}`);
                }

                return response.json();
                
            })
            .then((result) => {
                let data = result.data;
                setVehicleList(data.vehicleList);
            })
            .catch((error) => {
                setErrorMessage('Failed to fetch app version data.');
                console.error(error);
            });
    };

    const genrateMapRoute = (id, tripCode = '') => {
        setLoadingMapTripId(id);
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/genratemaproute/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch data. Status: ${response.status}`);
                }

                return response.json();
            })
            .then((result) => {
                console.log('genrateMapRoute result:', result);
                let imgData = result?.data?.image || result?.data;
                if (imgData && typeof imgData === 'object') {
                    imgData = imgData.base64 || imgData.image || imgData.data || '';
                }

                if (typeof imgData === 'string' && imgData.trim().length > 0) {
                    const formattedSrc = imgData.startsWith('data:image/')
                        ? imgData
                        : `data:image/png;base64,${imgData}`;

                    setMapImage(formattedSrc);
                    setSelectedTripForMap(tripCode || id);
                    setMapModalOpen(true);
                } else {
                    setErrorMessage('Route map image not found in response.');
                }
            })
            .catch((error) => {
                setErrorMessage('Failed to generate route map.');
                console.error(error);
            })
            .finally(() => {
                setLoadingMapTripId(null);
            });
    };

    const handleDownloadMap = () => {
        if (!mapImage) return;
        const safeTripName = String(selectedTripForMap || 'map').replace(/[^a-zA-Z0-9_-]/g, '_');
        const link = document.createElement('a');
        link.href = mapImage;
        link.download = `trip-route-${safeTripName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCloseMapModal = () => {
        setMapModalOpen(false);
        setMapImage('');
        setSelectedTripForMap(null);
    };


    const getTrips = async (page_num, perPage = 10) => {
        const queryParams = new URLSearchParams({
            page: page_num,
            perPage,
        });

        // Append admin filter if applicable
        if (typeof isFromAdmin === 'boolean') {
            queryParams.append('isFromAdmin', isFromAdmin);
        }

        if (selectedStatus !== null && selectedStatus !== undefined) {
            queryParams.append('status', selectedStatus);
        }

        if (date_type) {
            queryParams.append('date_type', date_type);
        }

        const queryString = queryParams.toString();
        console.log(`queryString is ${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/trips?${queryString}`);
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/trips?${queryString}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            }
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                setData(data.data);
                setTotalRecords(data.totalItems);
                setTotalPages(data.totalPages);
                setCurrentPage(data.currentPage);
                setPerPage(data.perPage);
            })
            .catch((err) => {
                console.log(err)
            })
    }

    useEffect(() => {
        if (!router.isReady) return;
        getTrips(0);
    }, [router.isReady, selectedStatus, isFromAdmin, date_type]); // Refetch if view changes



    const handleSearch = async () => {
        const query = searchTerm.trim();
        if (!query) {
            getTrips(0);

            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/ride-search/${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to search. Status: ${response.status}`);
            }

            const resData = await response.json();
            const trip = resData.data;

            if (trip) {
                const tripArray = Array.isArray(trip) ? trip : [trip];
                setData(tripArray);
                setTotalRecords(tripArray.length);
                setTotalPages(1);
                setCurrentPage(1);
                setSuccessMessage('Trip found successfully!');
            } else {
                setData([]);
                setTotalRecords(0);
                setTotalPages(0);
                setErrorMessage('No trip found with this Trip ID.');
            }
        } catch (error) {
            console.error('Search error:', error);
            setErrorMessage('Failed to search trip.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        getTrips(0);
    };


    const handleDelete = async (idToDelete) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/delete-trip/${idToDelete}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setSuccessMessage('Trip deleted successfully!')
                    getTrips(0, perPage); // Refresh
                } else {
                    setErrorMessage(data.message)
                }
            })
            .catch(error => {
                console.error('Error:', error)
            })

    }

    const handleUpdateStatus = (id, newStatus) => {
        setData(data.map(notification =>
            notification.id === id ? { ...notification, status: newStatus } : notification
        ))
    }

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);

    const handleView = (row) => {
        setSelectedRowData(row);
        setDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
        setSelectedRowData(null);
    };

    const handleStatusChange = (status) => {
        setSelectedStatus(status);
    };

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 120,
            renderCell: (params) => (
                <span
                    style={{ color: '#1976d2', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => handleView(params.row)}
                >
                    {params.row.trip_id}
                </span>
            )
        },
        {
            field: 'trip_type',
            headerName: 'Trip Type',
            width: 140,
            renderCell: (params) => {
                const typeMap = {
                    1: 'Local',
                    2: 'Rental',
                    3: 'Outstation'
                };

                const typeLabel = typeMap[params.row.trip_type] || 'N/A';

                return (
                    <span style={{ fontWeight: 500 }}>
                        {typeLabel}
                    </span>
                );
            }
        }
        ,
        {
            field: 'status',
            headerName: 'Trip Status',
            width: 120,
            renderCell: (params) => {
                const statusMap = {
                    0: { label: 'New Trip', color: '#1976d2' },
                    1: { label: 'Accepted by Driver', color: '#00796b' },
                    3: { label: 'Started', color: '#0288d1' },
                    4: { label: 'Completed', color: '#388e3c' },
                    5: { label: 'Cancelled', color: '#f06502' },
                    6: { label: 'Advance Booking', color: '#f57c00' },
                    7: { label: 'On the Way', color: '#fbc02d' },
                    8: { label: 'Arrived at Pickup', color: '#7b1fa2' },
                    9: { label: 'Missed', color: '#eb4034' }

                };

                const status = statusMap[params.row.status] || { label: 'Unknown', color: '#757575' };

                return (
                    <span style={{ color: status.color, fontWeight: 'bold' }}>
                        {status.label}
                    </span>
                );
            }
        }

        ,
        { field: 'bookingDate', headerName: 'Booking Date', width: 160, renderCell: (params) => formatDate(params.row.pickup_date), },
        { field: 'createdDate', headerName: 'Created Date', width: 160, renderCell: (params) => formatDate(params.row.created_at), },

        {
            field: 'customer_name',
            headerName: 'Customer Name',
            width: 150,
            renderCell: (params) => (
                <span>{params.row.customer?.first_name || ''}</span>
            )
        },


        {
            field: 'customer_phone',
            headerName: 'Customer Number',
            width: 160,
            renderCell: (params) => (
                <span>{params.row.customer?.phone_number || ''}</span>
            )
        },

        {
            field: 'driver_name', headerName: 'Driver Name', width: 150,
            renderCell: (params) => (
                <span>{params.row.driver?.driverName || ''}</span>
            )
        },
        {
            field: 'phon', headerName: 'Driver Mob', width: 150,
            renderCell: (params) => (
                <span>{params.row.driver?.phone_number || ''}</span>
            )
        },

        { field: 'distance', headerName: 'Ride Distance', width: 140 },

        { field: 'bookamt', headerName: 'Booking Amt', width: 120 },
        { field: 'gst', headerName: 'GST Amt', width: 120 },
        { field: 'total', headerName: 'Final Amt', width: 120 },
        {
            field: 'driver_earning',
            headerName: 'Driver Earning',
            width: 120,
            renderCell: (params) => (
                parseFloat(params.row.driver_earning) > 0
                    ? <span>₹{parseFloat(params.row.driver_earning).toFixed(2)}</span>
                    : null
            )
        },
        {
            field: 'company_amount',
            headerName: 'Admin Earning',
            width: 120,
            renderCell: (params) => (
                parseFloat(params.row.company_amount) > 0
                    ? <span>₹{parseFloat(params.row.company_amount).toFixed(2)}</span>
                    : null
            )
        }
        ,
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            sortable: false,
            renderCell: (params) => (
                <>

                    <IconButton
                        aria-label="view"
                        color="info"
                        onClick={() => router.push(`/logs/trip-details?trip_id=${params.row.id}`)}
                    >
                        <Info />
                    </IconButton>

                    <IconButton
                        aria-label="edit"
                        color="primary"
                        onClick={() => {
                            // Assuming edit page might need to know about admin status too, or just unified
                            // For now, redirect to detailed page or standard add/edit
                            // Since this codebase seems to use "View" mostly, we keep it simple
                        }}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        aria-label="view"
                        color="info"
                        onClick={() => handleView(params.row)}
                    >
                        <VisibilityIcon />
                    </IconButton>
                    
                    <IconButton
                        aria-label="view map route"
                        color="info"
                        title="Generate Route Map"
                        disabled={loadingMapTripId === params.row.id}
                        onClick={() => genrateMapRoute(params.row.id, params.row.trip_id)}
                    >
                        {loadingMapTripId === params.row.id ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            <Map />
                        )}
                    </IconButton>
                </>
            )

        }

    ];

    return (
        <Grid container spacing={4} sx={{ bgcolor: "white", padding: 3 }}>
            <Grid item xs={6}>
                <Typography variant='h5'>
                    {title} {type == 'active' ? '(Active)' : ''}
                </Typography>
            </Grid>
            <Grid
                item
                xs={12}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <Select
                            value={selectedStatus}
                            onChange={(e) => handleStatusChange(e.target.value)}
                        >
                            <MenuItem value={null}>All Status</MenuItem>
                            <MenuItem value={0}>New Trip</MenuItem>
                            <MenuItem value={1}>Accepted by Driver</MenuItem>
                            <MenuItem value={3}>Trip Started</MenuItem>
                            <MenuItem value={7}>On the Way</MenuItem>
                            <MenuItem value={8}>Arrived at Pickup</MenuItem>
                            <MenuItem value={6}>Advance Booking</MenuItem>
                            <MenuItem value={4}>Completed</MenuItem>
                            <MenuItem value={5}>Cancelled</MenuItem>
                            <MenuItem value={9}>Missed Trip</MenuItem>
                            <MenuItem value={'ongoing'}>On Going</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        size="small"
                        placeholder="Search by Trip ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                        sx={{ minWidth: 220 }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={isSearching ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
                        onClick={handleSearch}
                        disabled={isSearching}
                    >
                        Search
                    </Button>
                    {searchTerm && (
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleClearSearch}
                        >
                            Clear
                        </Button>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {showAddButton && (
                        <Button
                            startIcon={(
                                <SvgIcon fontSize="small">
                                    <PlusIcon />
                                </SvgIcon>
                            )}
                            variant="contained"
                            onClick={() => router.push('/trips/add')}
                        >
                            Add
                        </Button>
                    )}
                    <ExportButton columns={columns} url={`trips`} />
                </div>
            </Grid>


            <Grid item xs={12}>
                <Card>
                    <CommonDataTable
                        columns={columns}
                        items={data}
                        onDelete={handleDelete}
                        onUpdateStatus={(id, newStatus) =>
                            setData((prevData) =>
                                prevData.map((item) =>
                                    item.id === id ? { ...item, status: newStatus } : item
                                )
                            )
                        }
                        totalRecords={totalRecords}
                        totalPages={totalPages}
                        currentPage={currentPage}
                        rowsPerPage={perPage}
                        onPageChange={getTrips}
                    />
                </Card>
            </Grid>

            <Snackbar
                open={!!errorMessage}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

            <Snackbar
                open={!!successMessage}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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
            <TripDrawer
                open={drawerOpen}
                onClose={handleDrawerClose}
                data={selectedRowData}
                vehicleList={vehicleList}
            />

            {/* Route Map Modal */}
            <Dialog
                open={mapModalOpen}
                onClose={handleCloseMapModal}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 2,
                        px: 3,
                        bgcolor: '#f5f5f7'
                    }}
                >
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        Trip Route Map {selectedTripForMap ? `(#${selectedTripForMap})` : ''}
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseMapModal}
                        size="small"
                        sx={{ color: 'grey.600' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent
                    dividers
                    sx={{
                        p: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 300,
                        bgcolor: '#fafafa'
                    }}
                >
                    {mapImage ? (
                        <Box
                            component="img"
                            src={mapImage}
                            alt="Trip Route Map"
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '70vh',
                                objectFit: 'contain',
                                borderRadius: 1,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        />
                    ) : (
                        <CircularProgress />
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleCloseMapModal}
                    >
                        Close
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadMap}
                        disabled={!mapImage}
                    >
                        Download Map
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    )
}

export default TripListContainer
