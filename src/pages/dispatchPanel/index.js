"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CardContent from "@mui/material/CardContent";
import { useRouter } from "next/router";
import {
    DrawingManager,
    GoogleMap,
    LoadScript,
    Marker,
    InfoWindow,
    Autocomplete
} from "@react-google-maps/api";
import { Window } from "@mui/icons-material";
import TripDrawer from "../trips/TripDrawer";

import { TextField, IconButton, Box, Tabs, Tab } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { listenForMessages } from "src/utils/NotificationPermission";
import ToastMessage from "src/components/ToastMessage";
import { useSocket } from "src/contexts/SocketContext";
import { formatDate, getRemainingTime } from "src/utils/utils";

const containerStyle = {
    width: "100%",
    height: "700px",
};

const center = {
    lat: 30.7333,
    lng: 76.7794
};




const DispatchPanel = () => {

    const router = useRouter();
    const { id } = router.query;
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoaded, setGoogleLoaded] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const mapRef = useRef(null);
    const [tripData, setTripData] = useState([])
    const [driversData, setDriversData] = useState([])
    const drawingManagerRef = useRef(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);
    const [locationSearch, setLocationSearch] = useState('');
    const [driverSearchText, setDriverSearchText] = useState('');
    const hoverTimeoutRef = useRef(null);
    const autocompleteRef = useRef(null);
    const [tabIndex, setTabIndex] = useState(0); // 0: Active, 1: Inactive


    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastSeverity, setToastSeverity] = useState('success');
    const [totalDriverCount, setTotalDriverCount] = useState(0)
    const [totalRideCount, setTotalRideCount] = useState(0)
    const [markerPosition, setMarkerPosition] = useState(null);
    const socket = useSocket();


    const token =
        typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    const googleRef = useRef(null);

    const onLoad = useCallback((mapInstance) => {
        mapRef.current = mapInstance;
        if (window.google) {
            googleRef.current = window.google;
            setGoogleLoaded(true);
        }
    }, []);

    // useEffect(() => {
    //     if (typeof google !== "undefined" && google.maps) {
    //         setGoogleLoaded(true);
    //     }
    // }, []);

    useEffect(() => {
        if (!socket) return;

        // 🔁 Remove cancelled or non-active trips
        socket.on('tripStatusUpdate', (msg) => {
            if (msg?.tripId && msg?.status !== 0) {
                // 1. Remove from trip list
                setTripData(prevData =>
                    prevData.filter(trip => trip.id !== msg.tripId)
                );

                // 2. Refresh drivers
                getActiveDrivers("", 0);

                // 3. Decrease ride count
                setTotalRideCount(prevCount => prevCount - 1);

                // 4. Clear selected row if it matches
                setSelectedRowData(prev =>
                    prev?.id === msg.tripId ? null : prev
                );
            }
        });


        // ➕ Add new trip to tripData
        socket.on('newTrip', (newTrip) => {
            getTrips();
            if (typeof window !== 'undefined') {
                const audio = new Audio('/dispatchNotificationTone.mp3');
                audio.play().catch(err => console.warn('Audio play failed:', err));
            }
        });

        return () => {
            socket.off('tripStatusUpdate');
            socket.off('newTrip');
        };
    }, [socket]);


    useEffect(() => {
        getTrips();
        getActiveDrivers("", 0)
    }, [])

    const handleTripNotification = useCallback((data) => {
        getTrips();
    }, []);

    useEffect(() => {

        listenForMessages(handleTripNotification);

        return () => {
            listenForMessages(null);
        };

    }, [handleTripNotification])

    useEffect(() => {
        getActiveDrivers("", tabIndex)
    }, [tabIndex, selectedRowData])

    const getTrips = async () => {

        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/getNewTripsList`, {
            method: 'GET',

            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            }
        })
            .then((response) => response.json())
            .then((data) => {
                setTripData(data.data);
                setTotalRideCount(data.count)
            })
            .catch((err) => {
                console.log(err)
            })
    }

    const getActiveDrivers = async (searchText = '', driverType = 0) => {

        const type = driverType === 0 ? 'active' : 'inactive';

        const queryParams = new URLSearchParams({
            searchText,
            type,
            lat: selectedRowData?.pickup_lat ?? 0,
            lng: selectedRowData?.pickup_lng ?? 0
        });

        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/getActiveDrivers?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            }
        })
            .then((response) => response.json())
            .then((data) => {
                setDriversData(data.data.drivers || []);
                setTotalDriverCount(data.data.totalCount || 0)
            })
            .catch((err) => {
                console.log(err)
            })
    }


    const handleView = (row) => {
        setSelectedRowData(row);
        setDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
        setSelectedRowData(null);
        getTrips();
    };

    const handleMouseOut = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setSelectedDriver(null);
        }, 500); // Delay to allow hover to move to InfoWindow
    };

    const handleDriverSearch = () => {
        getActiveDrivers(driverSearchText, tabIndex)
    };

    const handlePlaceChanged = () => {
        const place = autocompleteRef.current.getPlace();
        if (place.geometry && place.geometry.location && mapRef.current) {
            const location = place.geometry.location;
            mapRef.current.panTo({
                lat: location.lat(),
                lng: location.lng(),
            });
            mapRef.current.setZoom(8);
        }
    };

    let pickupMarker = null; // define this at the top level, so it doesn't stack markers
    const pickupMarkerRef = React.useRef(null);

    const goToPickupLocation = (trip) => {
        setSelectedRowData(trip);
        try {
            const latitude = parseFloat(trip.pickup_lat);
            const longitude = parseFloat(trip.pickup_lng);

            console.log(typeof latitude, typeof longitude); // should both be 'number'

            if (
                mapRef.current &&
                !isNaN(latitude) &&
                !isNaN(longitude)
            ) {
                const position = { lat: latitude, lng: longitude };

                // Pan and zoom
                mapRef.current.panTo(position);
                mapRef.current.setZoom(12);

                // Remove existing marker if already set
                if (pickupMarkerRef.current) {
                    pickupMarkerRef.current.setMap(null);
                }

                // Add new marker at pickup location
                pickupMarker = new window.google.maps.Marker({
                    position,
                    map: mapRef.current,
                    title: 'Pickup Location',
                    icon: {
                        url: "/icons/ride_location.png",
                        scaledSize: new window.google.maps.Size(30, 30),
                    },
                });
            } else {
                console.warn("Invalid latitude or longitude:", lat, lng);
            }
        } catch (error) {
            console.error("Error navigating to pickup location:", error);
        }
    };

    const goToDriverLocation = (driver) => {
        try {
            const latitude = parseFloat(driver.latitude);
            const longitude = parseFloat(driver.longitude);

            if (mapRef.current && !isNaN(latitude) && !isNaN(longitude)) {
                const position = { lat: latitude, lng: longitude };

                // Pan and zoom
                mapRef.current.panTo(position);
                mapRef.current.setZoom(12);

                // Remove existing marker
                if (pickupMarkerRef.current) {
                    pickupMarkerRef.current.setMap(null);
                }

                // Create new marker
                const marker = new window.google.maps.Marker({
                    position,
                    map: mapRef.current,
                    icon: {
                        url: "/icons/active_car.png",
                        scaledSize: new window.google.maps.Size(30, 30),
                    },
                });

                // Store full driver info in marker
                marker.driverData = driver;

                // Create InfoWindow
                const infoWindow = new window.google.maps.InfoWindow();

                marker.addListener("click", () => {

                });
                const d = marker.driverData;

                const contentHtml = `
          <div style="font-size: 14px; min-width: 200px;">
            <div style="font-weight: bold; margin-bottom: 8px;">Driver Details</div>
            
            <div><strong>ID:</strong> ${d.id}</div>
            <div><strong>Name:</strong> ${d.driverName}</div>
            <div><strong>Phone:</strong> ${d.phone_number}</div>
            <div><strong>Vehicle:</strong> ${d.vehicleCategory?.vehicle_type || 'N/A'}</div>
          </div>
        `;

                infoWindow.setContent(contentHtml);
                infoWindow.open(mapRef.current, marker);
                pickupMarkerRef.current = marker;
            } else {
                console.warn("Invalid latitude or longitude:", latitude, longitude);
            }
        } catch (error) {
            console.error("Error navigating to driver location:", error);
        }
    };


    useEffect(() => {
        if (mapRef.current && driversData.length > 0 && window.google) {
            const bounds = new window.google.maps.LatLngBounds();

            driversData.forEach((driver) => {
                if (
                    driver.latitude != null &&
                    driver.longitude != null &&
                    driver.latitude !== 0 &&
                    driver.longitude !== 0
                ) {
                    bounds.extend({ lat: driver.latitude, lng: driver.longitude });
                }
            });

            // Only fit bounds if there are valid points
            if (!bounds.isEmpty()) {
                mapRef.current.fitBounds(bounds);
            }
        }
    }, [driversData]);


    const handleChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const requestDriver = (driver) => {

        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/sendRequestToDriver`, {
            method: 'PUT',

            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            },
            body: JSON.stringify({
                driverId: driver.id,
                tripId: selectedRowData.id
            }),
        })
            .then((response) => response.json())
            .then((data) => {

                if (data.success) {
                    setToastMessage(data.message);
                    setToastSeverity("success");
                    setToastOpen(true);

                    //  onClose(true);

                } else {
                    setToastMessage(data.message);
                    setToastSeverity("error");
                    setToastOpen(true);
                    setErrorMessage("Driver not found");
                }
            })
            .catch((err) => {
                console.error(err);
                setToastMessage("Something went wrong!");
                setToastSeverity("error");
                setToastOpen(true);
            });
    }


    const AssignDriverToTrip = (driver) => {


        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/assignTripToDriver`, {
            method: 'PUT',

            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            },
            body: JSON.stringify({
                driverId: driver.id,
                tripId: selectedRowData.id
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setToastMessage(data.message);
                    setToastSeverity("success");
                    setToastOpen(true);
                    getTrips();
                } else {
                    setToastMessage(data.message);
                    setToastSeverity("error");
                    setToastOpen(true);

                }
            })
            .catch((err) => {
                console.error(err);
                setToastMessage("Something went wrong!");
                setToastSeverity("error");
                setToastOpen(true);
            });
    }

    const exportDriversCSV = () => {
        if (!driversData?.length) return;

        const drivers = driversData;

        const rows = drivers.map(driver => ({
            Id: driver.id,
            Name: driver.driverName,
            Phone: driver.phone_number,
            Email: driver.email,
            VehicleType: driver.vehicleCategory?.vehicle_type || '',
            CabCategory: driver.cabCategory,
            Latitude: driver.latitude,
            Longitude: driver.longitude,
            LastLocation: driver.lastLocationUpdateAt,
            PickupAddress: driver.latestTrip?.pickup_address || '',
            DropAddress: driver.latestTrip?.drop_address || '',
            TripStatus: driver.latestTrip?.status || '',
            TripCreated: driver.latestTrip?.created_at || '',
            TripPickupTime: driver.latestTrip?.pickup_date || '',
        }));

        const header = Object.keys(rows[0]).join(',');

        const csv = [
            header,
            ...rows.map(row =>
                Object.values(row)
                    .map(val => `"${String(val).replace(/"/g, '""')}"`)
                    .join(',')
            )
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'drivers_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };


    return (
        <>
            <LoadScript
                googleMapsApiKey={'AIzaSyA3GfFqfSjITAXoeaK_kDce__LJa8iCK7M'}
                libraries={['places', 'drawing']}
                onLoad={() => setGoogleLoaded(true)}
            >
                <Box display="flex" gap={2} style={{ marginBottom: 10 }} alignItems="center" top={0} left={0} zIndex={1000} >
                    {/* Location Search */}
                    {googleLoaded && (
                        <Autocomplete
                            onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                            onPlaceChanged={handlePlaceChanged}
                        >
                            <TextField
                                variant="outlined"
                                size="small"
                                placeholder="Search location"
                                value={locationSearch}
                                onChange={(e) => setLocationSearch(e.target.value)}
                                style={{ width: 300 }}
                            />
                        </Autocomplete>
                    )}

                    {/* Driver Search */}
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search driver (ID or phone)"
                        value={driverSearchText}
                        onChange={(e) => setDriverSearchText(e.target.value)}
                        style={{ width: 300 }}
                        InputProps={{
                            endAdornment: (
                                <IconButton onClick={handleDriverSearch}>
                                    <SearchIcon />
                                </IconButton>
                            ),
                        }}
                    />
                </Box>
                <div style={{ position: 'relative', width: '100%' }}>
                    {/* Left Overlay */}

                    <div style={{ display: 'flex' }}>
                        {/* Side panel */}
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '270px',
                                height: '100%',
                                backgroundColor: 'rgba(70, 130, 180, 0.9)',
                                zIndex: 10,
                                color: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <div
                                style={{
                                    padding: '5px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    borderBottom: '1px solid #ffffff',
                                    textAlign: 'center',
                                    color: "#FFFFFF"
                                }}
                            >
                                Ride Request ({totalRideCount})
                            </div>

                            {/* Scrollable list */}
                            <div
                                style={{
                                    overflowY: 'auto',
                                    padding: '5px',
                                    flex: 1,
                                }}
                            >
                                {googleLoaded && tripData.map((trip) => {
                                    const createdAt = new Date(trip.created_at);
                                    const now = new Date();
                                    const isNew = (now - createdAt) < 15000; // less than 15 seconds

                                  return (
  <div
    key={trip.id}
    className={isNew ? 'blink' : ''}
    style={{
      marginBottom: '20px',
      padding: '10px',
      borderRadius: '12px',
      backgroundColor: selectedRowData?.id === trip.id ? '#fcba03' :  '#f0f0f0',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e0e0e0',
      fontSize: '14px',
      lineHeight: '1.6',
      color:"#000000"
    }}
  >
    {/* Badges - shown above Trip ID */}
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
      {trip.trip_type === 1 && (
        <span style={{  color: '#0f5132', padding: '2px 5px', borderRadius: '8px', fontWeight: 600 }}>
          Local
        </span>
      )}
      {trip.trip_type === 3 && (
        <span style={{  color: '#055160', padding: '2px 5px', borderRadius: '8px', fontWeight: 600 }}>
          Outstation
        </span>
      )}
      {trip.status === 0 && (
        <span style={{  color: '#842029', padding: '2px 5px', borderRadius: '8px', fontWeight: 600 }}>
          Instant
        </span>
      )}
      {trip.status === 6 && (
        <span style={{  color: '#1a1a77', padding: '2px 5px', borderRadius: '8px', fontWeight: 600 }}>
          Scheduled
        </span>
      )}
      {trip.pickup_date && (
        <span style={{ backgroundColor: '#ffffff', color: '#333', padding: '2px 5px', borderRadius: '8px', fontWeight: 500 }}>
  Pickup: {formatDate(trip.pickup_date)} {getRemainingTime(trip.pickup_date)}
</span>
      )}
    </div>

    {/* Trip Details */}
    <div onClick={() => handleView(trip)} style={{ marginBottom: '8px' }}>
      <strong style={{ color: '#9acd32' }}>Trip ID:</strong> {trip.trip_id}
    </div>

    <div>
      <strong>Customer:</strong>{' '}
      {trip.customer?.first_name || trip.customer?.last_name
        ? `${trip.customer?.first_name || ''} ${trip.customer?.last_name || ''}`.trim()
        : 'N/A'}
    </div>

    <div>
      <strong>Phone:</strong>
      {trip.customer?.phone_number && ` ${trip.customer.phone_number}`}
    </div>


    <div>
      <strong>Pickup:</strong>{' '}
      <span
        style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
        onClick={() => goToPickupLocation(trip)}
      >
        {trip.pickup_address}
      </span>
    </div>

    <div><strong>Drop:</strong> {trip.drop_address}</div>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '8px' }}>
  <div><strong>{trip.vehicleCategory?.vehicle_type || '—'}</strong></div>
  <div><strong>Total:</strong> ₹{trip.total}</div>
</div>
  </div>
);


                                })}


                            </div>
                        </div>

                        {/* Ride list content can go here */}
                    </div>

                    {/* Right Overlay */}
                    <div style={{ display: 'flex' }}>
                        {/* Right-side panel */}
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '250px',
                                height: '100%',
                                backgroundColor: 'rgba(70, 130, 180, 0.9)',
                                zIndex: 10,
                                color: '#000',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <div
                                style={{
                                    padding: '5px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',

                                    textAlign: 'center',
                                    color: "#ffffff"
                                }}
                            >
                                <div style={{ position: 'relative', padding: '5px', color: '#ffffff' }}>
                                    <div style={{ textAlign: 'left', fontSize: '16px', fontWeight: 'bold' }}>
                                        Drivers ({totalDriverCount})
                                    </div>

                                    <div style={{ position: 'absolute', right: '10px', top: '5px' }}>
                                        <button
                                            onClick={exportDriversCSV}
                                            style={{
                                                backgroundColor: '#ffffff',
                                                color: '#007bff',
                                                padding: '6px 12px',
                                                border: '1px solid #007bff',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Export
                                        </button>
                                    </div>
                                </div>


                                <Box
                                    sx={{
                                        borderBottom: 1,
                                        borderColor: 'divider',
                                        textAlign: 'center',

                                    }}
                                >
                                    <Tabs
                                        value={tabIndex}
                                        onChange={handleChange}
                                        centered
                                        textColor="inherit"
                                        TabIndicatorProps={{ style: { backgroundColor: 'white' } }}
                                    >
                                        <Tab label="Active" sx={{ color: 'white' }} />
                                        <Tab label="Inactive" sx={{ color: 'white' }} />
                                    </Tabs>
                                </Box>

                            </div>

                            {/* Scrollable drivers list */}


                            <div
                                style={{
                                    overflowY: 'auto',
                                    padding: '10px',
                                    flex: 1,
                                }}
                            >

                                {driversData.map((driver) => {
                                    const lastSeen = new Date(driver.lastLocationUpdateAt);
                                    const now = new Date();
                                    const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
                                    const isInactive = now - lastSeen > threeDaysInMs;

                                    return (
                                        <div
                                            key={driver.id}
                                            style={{
                                                marginBottom: '16px',
                                                padding: '12px',
                                                borderRadius: '10px',
                                                backgroundColor: '#f0f0f0',
                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                                                fontSize: '14px',
                                                lineHeight: '1.6',
                                            }}
                                        >
                                            <div
                                                onClick={() => goToDriverLocation(driver)}
                                                style={{
                                                    color: '#17a2b8',
                                                    cursor: 'pointer',

                                                    marginBottom: '6px',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                📍 Current Location
                                            </div>
                                            <div><strong style={{ color: '#007bff' }}>Id:</strong> {driver.id}</div>
                                            <div><strong style={{ color: '#007bff' }}>Name:</strong> {driver.driverName}</div>
                                            <div><strong>Phone:</strong> {driver.phone_number}</div>
                                            <div>
                                                <strong>Vehicle:</strong>{' '}
                                                {driver.vehicleCategory ? driver.vehicleCategory.vehicle_type : 'N/A'}
                                            </div>
                                            <div>
                                                <strong>Distance:</strong>{' '}
                                                {driver.distance_km !== undefined
                                                    ? `${driver.distance_km.toFixed(2)} km`
                                                    : 'N/A'}
                                            </div>

                                            {(selectedRowData?.id && !isInactive) ? (
                                                <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                                                    <button
                                                        onClick={() => requestDriver(driver)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: '#007bff',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        Request
                                                    </button>
                                                    <button
                                                        onClick={() => AssignDriverToTrip(driver)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: '#28a745',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        Assign
                                                    </button>
                                                </div>
                                            ) : (
                                                <div style={{ marginTop: '12px', color: '#dc3545' }}>
                                                    <strong>Last Login:</strong> {lastSeen.toLocaleDateString()} {lastSeen.toLocaleTimeString()}
                                                </div>
                                            )}

                                        </div>
                                    );
                                })}

                            </div>
                        </div>

                        {/* You can place other content here */}
                    </div>

                    {/* Google Map */}

                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={center}
                        zoom={15}
                        onLoad={onLoad}
                    >

                        {googleLoaded && driversData
                            .filter(driver => driver.latitude && driver.longitude) // Ensures both are not null/0
                            .map((driver) => (
                                <Marker
                                    key={driver.id}
                                    position={{ lat: driver.latitude, lng: driver.longitude }}
                                    onClick={() => setSelectedDriver(driver)}
                                    onMouseOver={() => setSelectedDriver(driver)}
                                    icon={{
                                        url:
                                            tabIndex === 1
                                                ? "/icons/inactive_car.png"
                                                : driver.latestTrip?.id
                                                    ? "/icons/busy_car.png"
                                                    : "/icons/active_car.png",
                                        scaledSize: googleLoaded
                                            ? new window.google.maps.Size(30, 30)
                                            : undefined,
                                    }}
                                />
                            ))}




                        {selectedDriver && (
                            <InfoWindow
                                position={{ lat: selectedDriver.latitude, lng: selectedDriver.longitude }}
                                onCloseClick={() => setSelectedDriver(null)}
                            >
                                <div
                                    onMouseEnter={() => clearTimeout(hoverTimeoutRef.current)}
                                    onMouseLeave={handleMouseOut}
                                    style={{ minWidth: '200px', fontSize: '14px' }}
                                >
                                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                                        Driver Details
                                    </div>

                                    <div><strong>ID:</strong> {selectedDriver.id}</div>
                                    <div><strong>Vehicle :</strong> {selectedDriver.vehicleCategory?.vehicle_type || 'N/A'}</div>
                                    <div><strong>Driver Name:</strong> {selectedDriver.driverName}</div>
                                    <div><strong>Driver Number:</strong> {selectedDriver.phone_number}</div>
                                </div>
                            </InfoWindow>

                        )}
                    </GoogleMap>

                    <TripDrawer
                        open={drawerOpen}
                        onClose={handleDrawerClose}
                        data={selectedRowData}
                    />
                </div>
            </LoadScript>
            <ToastMessage
                open={toastOpen}
                message={toastMessage}
                severity={toastSeverity}
                onClose={() => setToastOpen(false)}
            />
        </>
    );
};

export default DispatchPanel;
