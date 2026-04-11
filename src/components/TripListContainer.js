import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { Button, FormControl, IconButton, InputLabel, Menu, MenuItem, Select, SvgIcon } from '@mui/material'
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
import { formatDate } from 'src/utils/utils';
import TripDrawer from '../pages/trips/TripDrawer'; // Adjusted import path
import VisibilityIcon from '@mui/icons-material/Visibility';

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


    let token
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('access_token')
    }
    const router = useRouter();
    const { type } = router.query;

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


    const exportToExcel = () => {
        setLoadingExport(true);
        try {
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/export-trips`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`
                }
            })
                .then(response => response.blob())
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'trips.csv';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                })
                .catch(error => {
                    console.error('Error exporting to Excel:', error);
                });
            setSuccessMessage('Export successful!');
        } catch (error) {
            setErrorMessage('Export failed. Please try again.');
        } finally {
            setLoadingExport(false);
        }
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
        getTrips(0);
    }, [selectedStatus, isFromAdmin]) // Refetch if view changes



    const searchTrips = async (searchdata) => {
        let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/trip-search?search=${searchdata}`;
        if (type) url += `&type=${type}`;
        if (typeof isFromAdmin === 'boolean') url += `&isFromAdmin=${isFromAdmin}`; // Assuming search also needs this filter

        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            }
        })
            .then((response) => response.json())
            .then((data) => {
                setData(data.data);
                setTotalRecords(data.totalRecords);
                setTotalPages(data.totalPages);
                setCurrentPage(data.currentPage);
                setPerPage(data.perPage);
            })
            .catch((err) => {
                console.log(err)
            })
    }


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

    const handleSearchMethod = (searchdata) => {
        searchTrips(searchdata)
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
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <>
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

                }}
            >
                <FormControl size="small" sx={{ minWidth: 200 }}>

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
                    </Select>
                </FormControl>

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
            </Grid>

            <Grid
                item
                xs={12}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '5px',
                }}
            >
                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* Export buttons usually go here */}
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
        </Grid>
    )
}

export default TripListContainer
