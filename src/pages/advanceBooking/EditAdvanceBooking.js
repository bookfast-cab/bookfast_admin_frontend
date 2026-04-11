import { useCallback, useEffect, useRef, useState } from 'react';

// ** MUI Imports
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useRouter } from 'next/router';
import { Autocomplete, LoadScript } from '@react-google-maps/api';
import dayjs from 'dayjs';

const EditAdvanceBooking = () => {
  const router = useRouter();
  const { id } = router.query; // booking id from URL
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    notificationType: 2,
    image: null,
    mobileNumber: '',
    status: 1,
    pickup: '',
    pickupLat: '',
    pickupLng: '',
    drop: '',
    dropLat: '',
    dropLng: '',
    date: '',
    enddate: '',
    fuel_type: '',
    cabCategory: '',
    commissionAmount: '',
    totalAmount: '',
    distance: '',
    estimatedTime: '',
    agent_name: '',
    agent_company: '',
  });

  // fetch booking details on mount
  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/getAdvanceTripById/${id}`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        const data = await res.json();
        if (data.success && data.data) {
  const trip = data.data;

  setFormData({
    title: trip.title || '',
    message: trip.description || '',
    notificationType: 2, // or map from API if needed
    image: null,
    mobileNumber: trip.contact_mobile || '',
    status: trip.status ?? 1,
    pickup: trip.pickup_address || '',
    pickupLat: trip.pickup_lat || '',
    pickupLng: trip.pickup_lng || '',
    drop: trip.drop_address || '',
    dropLat: trip.drop_lat || '',
    dropLng: trip.drop_lng || '',
    date: trip.pickup_date  ? dayjs(trip.pickup_date).format("YYYY-MM-DDTHH:mm") : '',
    enddate: trip.end_time || '',
    fuel_type: trip.fuel_type || '',
    cabCategory: trip.vehicle_type || '',
    commissionAmount: trip.commission_amount || '',
    totalAmount: trip.total_amount || '',
    distance: trip.distance || '',
    estimatedTime: trip.estimated_time || '',
    agent_name: trip.agent_name || '',
    agent_company: trip.agent_company || '',
  });
}
 else {
          setErrorMessage(data.message || 'Failed to load booking details');
        }
      } catch (err) {
        console.error(err);
        setErrorMessage('Error loading booking details');
      }
    };

    fetchBooking();
  }, [id]);

  const handleCloseSnackbar = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      if (
        (name === 'date' || name === 'estimatedTime') &&
        updated.date &&
        updated.estimatedTime
      ) {
        updated.enddate = calculateEndDate(
          updated.date,
          updated.estimatedTime
        );
      }

      console.log(name,value);

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/updateAdvanceTrip/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      if (data.success) {
        setSuccessMessage(data.message);
        setTimeout(() => router.push('/advanceBooking'), 1000);
      } else {
        setErrorMessage(data.message);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  const calculateEndDate = (startDateStr, durationStr) => {
    if (!startDateStr || !durationStr) return '';
    const startDate = new Date(startDateStr);
    let minutesToAdd = 0;

    const hourMinRegex = /(\d+)\s*hour[s]?\s*(\d+)?\s*min[s]?/i;
    const hourOnlyRegex = /(\d+)\s*hour[s]?/i;
    const minOnlyRegex = /(\d+)\s*min[s]?/i;

    if (hourMinRegex.test(durationStr)) {
      const match = durationStr.match(hourMinRegex);
      minutesToAdd = parseInt(match[1]) * 60 + parseInt(match[2] || '0');
    } else if (hourOnlyRegex.test(durationStr)) {
      const match = durationStr.match(hourOnlyRegex);
      minutesToAdd = parseInt(match[1]) * 60;
    } else if (minOnlyRegex.test(durationStr)) {
      const match = durationStr.match(minOnlyRegex);
      minutesToAdd = parseInt(match[1]);
    }

    startDate.setMinutes(startDate.getMinutes() + minutesToAdd);
    const yyyy = startDate.getFullYear();
    const mm = String(startDate.getMonth() + 1).padStart(2, '0');
    const dd = String(startDate.getDate()).padStart(2, '0');
    const hh = String(startDate.getHours()).padStart(2, '0');
    const mi = String(startDate.getMinutes()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  const [pickupRef, setPickupRef] = useState(null);
  const [dropRef, setDropRef] = useState(null);

  const handlePlaceSelect = async (place, fieldName) => {
    if (!place?.geometry) return;
    const location = place.formatted_address || place.name;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    const updated = {
      ...formData,
      [fieldName]: location,
      [`${fieldName}Lat`]: lat,
      [`${fieldName}Lng`]: lng,
    };

    setFormData(updated);

    const pickupLat = fieldName === 'pickup' ? lat : formData.pickupLat;
    const pickupLng = fieldName === 'pickup' ? lng : formData.pickupLng;
    const dropLat = fieldName === 'drop' ? lat : formData.dropLat;
    const dropLng = fieldName === 'drop' ? lng : formData.dropLng;

    if (pickupLat && pickupLng && dropLat && dropLng && window.google) {
      const service = new window.google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [{ lat: parseFloat(pickupLat), lng: parseFloat(pickupLng) }],
          destinations: [
            { lat: parseFloat(dropLat), lng: parseFloat(dropLng) },
          ],
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
        },
        (res, status) => {
          if (status === 'OK') {
            const element = res.rows[0].elements[0];
            if (element.status === 'OK') {
              setFormData((prev) => ({
                ...prev,
                distance: element.distance.text,
                estimatedTime: element.duration.text,
              }));
            }
          }
        }
      );
    }
  };

  const googleRef = useRef(null);
  const mapRef = useRef(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  const onLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance;
    if (window.google) {
      googleRef.current = window.google;
      setGoogleLoaded(true);
    }
  }, []);

  return (
    <Card>
        <LoadScript
                googleMapsApiKey="AIzaSyA3GfFqfSjITAXoeaK_kDce__LJa8iCK7M"
                libraries={['places', 'drawing']}
            >
        <CardContent>
          <Grid container spacing={6}>
            <Grid item xs={6}>
              <Typography variant="h6">Edit Advance Booking</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Button variant="contained" onClick={() => router.push('/advanceBooking')}>
                Back
              </Button>
            </Grid>
          </Grid>

         <form onSubmit={handleSubmit}>
                                 
                                 <TextField
                                     label="Title"
                                     name="title"
                                     value={formData.title}
                                     onChange={handleChange}
                                     required
                                     fullWidth
                                     margin="normal"
                                 />
                                 <TextField
                                     label="Message"
                                     name="message"
                                     value={formData.message}
                                     onChange={handleChange}
                                     required
                                     fullWidth
                                     margin="normal"
                                     multiline
                                     rows={4}
                                 />
         
                                 {/* Agent Information Section */}
                                 <Box sx={{ mt: 2 }}>
                                     <Grid container spacing={2}>
                                         <Grid item xs={12} md={6}>
                                             <TextField
                                                 label="Agent Name"
                                                 name="agent_name"
                                                 value={formData.agent_name}
                                                 onChange={handleChange}
                                                 required
                                                 fullWidth
                                             />
                                         </Grid>
                                         <Grid item xs={12} md={6}>
                                             <TextField
                                                 label="Agent Company"
                                                 name="agent_company"
                                                 value={formData.agent_company}
                                                 onChange={handleChange}
                                                 fullWidth
                                             />
                                         </Grid>
                                     </Grid>
                                 </Box>
         
                                 <Box sx={{ mt: 2 }}>
                                     <Grid container spacing={2}>
                                         <Grid item xs={12} md={3}>
                                             <Autocomplete
                                                 onLoad={(ref) => setPickupRef(ref)}
                                                 onPlaceChanged={() => handlePlaceSelect(pickupRef.getPlace(), 'pickup')}
                                             >
                                                 <TextField
                                                     label="Pickup Location"
                                                     name="pickup"
                                                     value={formData.pickup}
                                                     onChange={handleChange}
                                                     required
                                                     fullWidth
                                                 />
                                             </Autocomplete>
                                         </Grid>
                                         <Grid item xs={12} md={3}>
                                             <Autocomplete
                                                 onLoad={(ref) => setDropRef(ref)}
                                                 onPlaceChanged={() => handlePlaceSelect(dropRef.getPlace(), 'drop')}
                                             >
                                                 <TextField
                                                     label="Drop Location"
                                                     name="drop"
                                                     value={formData.drop}
                                                     onChange={handleChange}
                                                     required
                                                     fullWidth
                                                 />
                                             </Autocomplete>
                                         </Grid>
                                         <Grid item xs={12} md={3}>
                                             <TextField
                                                 label="Distance"
                                                 name="distance"
                                                 value={formData.distance}
                                                 onChange={handleChange}
                                                 fullWidth
                                                 InputProps={{ readOnly: true }}
                                             />
                                         </Grid>
                                         <Grid item xs={12} md={3}>
                                             <TextField
                                                 label="Estimated Time"
                                                 name="estimatedTime"
                                                 value={formData.estimatedTime}
                                                 onChange={handleChange}
                                                 fullWidth
                                                 InputProps={{ readOnly: true }}
                                             />
                                         </Grid>
                                     </Grid>
                                 </Box>
         
                                 <Box sx={{ mt: 2 }}>
                                     <TextField
                                         label="Mobile Number"
                                         name="mobileNumber"
                                         value={formData.mobileNumber}
                                         onChange={handleChange}
                                         required
                                         fullWidth
                                     />
                                 </Box>
         
                                 {/* === Additional Trip Fields === */}
                                 <TextField
                                     label="Date"
                                     name="date"
                                     type="datetime-local"
                                     value={formData.date}
                                     onChange={handleChange}
                                     fullWidth
                                     margin="normal"
                                     InputLabelProps={{ shrink: true }}
                                 />
          <TextField
                                     label="Estimated End date/time"
                                     name="end_date"
                                     type="text"
                                     value={formData.enddate}
                                    
                                     fullWidth
                                     margin="normal"
                                     InputLabelProps={{ shrink: true }}
                                 />
                                 <Box sx={{ mt: 2 }}>
                                     <Grid container spacing={2}>
                                         {/* <Grid item xs={12} md={4}>
                                             <TextField
                                                 label="Toll Tax"
                                                 name="tollTax"
                                                 type="number"
                                                 value={formData.tollTax}
                                                 onChange={handleChange}
                                                 fullWidth
                                             />
                                         </Grid> */}
         
                                         <Grid item xs={12} md={4}>
                                             <TextField
                                                 label="Commission Amount"
                                                 name="commissionAmount"
                                                 type="number"
                                                 value={formData.commissionAmount}
                                                 onChange={handleChange}
                                                 fullWidth
                                             />
                                         </Grid>
         
                                         <Grid item xs={12} md={4}>
                                             <TextField
                                                 label="Total Amount"
                                                 name="totalAmount"
                                                 type="number"
                                                 value={formData.totalAmount}
                                                 onChange={handleChange}
                                                 fullWidth
                                             />
                                         </Grid>
                                     </Grid>
                                 </Box>
         
                                 <Box sx={{ mt: 2 }}>
                                     <Grid container spacing={2}>
                                         <Grid item xs={12} md={6}>
                                             <TextField
                                                 label="Cab Category"
                                                 name="cabCategory"
                                                 value={formData.cabCategory}
                                                 onChange={handleChange}
                                                 fullWidth
                                             />
                                         </Grid>
         
                                         <Grid item xs={12} md={6}>
                                             <TextField
                                                 label="Fuel Type"
                                                 name="fuel_type"
                                                 value={formData.fuel_type}
                                                 onChange={handleChange}
                                                 fullWidth
                                             />
                                         </Grid>
                                     </Grid>
                                 </Box>
         
         
                                 <Button sx={{ mt: 3 }} variant="contained" color="primary" type="submit">
                                     Update
                                 </Button>
         
                                 {/* Snackbars */}
                                 <Snackbar open={!!errorMessage} autoHideDuration={3000} onClose={handleCloseSnackbar}>
                                     <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="error">
                                         {errorMessage}
                                     </MuiAlert>
                                 </Snackbar>
         
                                 <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={handleCloseSnackbar}>
                                     <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="success">
                                         {successMessage}
                                     </MuiAlert>
                                 </Snackbar>
                             </form>
        </CardContent>
      </LoadScript>
    </Card>
  );
};

export default EditAdvanceBooking;
