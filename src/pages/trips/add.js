import { useEffect, useState } from "react";

// MUI
import {
  Box,
  Card,
  Grid,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  Snackbar,
  FormControl,
  InputLabel,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  Avatar,
  Stack
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";

import { useRouter } from "next/router";

import {
  LoadScript,
  Autocomplete
} from "@react-google-maps/api";

import CustomerSearchDrawer from "../customers/CustomerSearchDrawer";
import DriverSearchDrawer from "src/components/DriverSearchDrawer";
import CommonDatePicker from "src/components/CommonDatePicker";

import PersonIcon from "@mui/icons-material/Person";
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi";

import dayjs from "dayjs";

const AddMenualTrip = () => {
  const router = useRouter();

  const [driverDrawerOpen, setDriverDrawerOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [vehicleList, setVehicleList] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDrawerOpen, setCustomerDrawerOpen] = useState(false);

  const [data, setData] = useState(null); // fare data for autoCalc mode
  const [tripDate, settripDate] = useState(dayjs());

  const [pickupRef, setPickupRef] = useState(null);
  const [dropRef, setDropRef] = useState(null);

  const [distanceKm, setDistanceKm] = useState(null);

  const [formErrors, setFormErrors] = useState({
    vehicle_type: ""
  });

  // Manual fare fields when autoCalc is OFF

  const [manualFare, setManualFare] = useState({
    km: "",
    price_per_km: "",
    base_fare: "",
    additional_fare: "",
    driverAllowance: "",
    tax: "",
    tollTax: "",
    discount: "",
    total_fare: ""
  });

  const [formData, setFormData] = useState({
    customerId: "",
    pickup: "",
    pickupLat: "",
    pickupLng: "",
    drop: "",
    dropLat: "",
    dropLng: "",
    tripType: "daily", // daily / outstation
    trip_sub_type: "1",
    vehicle_type: "",
    couponCode: "",
    bookingType: "instant", // instant / schedule
    autoCalc: false, // default: manual
    paymentMode: "cash",
    driverId: ""
  });

  // Driver Payment State
  const [driverPayment, setDriverPayment] = useState({
    amountGiven: "",
    remainingAmount: "",
    paymentMethod: "" // "wallet" or "upi"
  });

  // Auto-calculate remaining amount
  useEffect(() => {
    const total = formData.autoCalc
      ? Number(data?.total_fare || 0)
      : Number(manualFare.total_fare || 0);

    const given = Number(driverPayment.amountGiven || 0);

    // Only calculate if we have a total fare
    if (total > 0) {
      const remaining = total - given;
      setDriverPayment(prev => ({
        ...prev,
        remainingAmount: remaining > 0 ? Number(remaining.toFixed(2)) : 0
      }));
    }
  }, [driverPayment.amountGiven, manualFare.total_fare, data?.total_fare, formData.autoCalc]);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  const handleCloseSnackbar = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Google place selection
  const handlePlaceSelect = (place, fieldName) => {
    if (!place?.geometry) return;

    const location = place.formatted_address || place.name;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setFormData(prev => {
      const updated = {
        ...prev,
        [fieldName]: location,
        [`${fieldName}Lat`]: lat,
        [`${fieldName}Lng`]: lng
      };

      // Run auto logic only when both points present
      if (
        updated.pickupLat &&
        updated.pickupLng &&
        updated.dropLat &&
        updated.dropLng
      ) {
        const R = 6371;
        const dLat = (updated.dropLat - updated.pickupLat) * Math.PI / 180;
        const dLon = (updated.dropLng - updated.pickupLng) * Math.PI / 180;

        const a =
          0.5 - Math.cos(dLat) / 2 +
          (Math.cos(updated.pickupLat * Math.PI / 180) *
            Math.cos(updated.dropLat * Math.PI / 180) *
            (1 - Math.cos(dLon))) / 2;

        const km = R * 2 * Math.asin(Math.sqrt(a));
        const kmRounded = Number(km.toFixed(2));

        setDistanceKm(kmRounded);
        setManualFare(prevFare => ({ ...prevFare, km: kmRounded }));

        // Trip type auto
        updated.tripType = kmRounded <= 25 ? "daily" : "outstation";

        // Vehicle auto selection
        if (kmRounded < 125) {
          const hatch = vehicleList.find(
            v =>
              v.vehicle_type &&
              v.vehicle_type.toLowerCase() === "hatchback"
          );
          if (hatch) updated.vehicle_type = hatch.id;
        } else {
          const sedanOrHigher =
            vehicleList.find(
              v =>
                v.vehicle_type &&
                v.vehicle_type.toLowerCase() === "sedan"
            ) ||
            vehicleList.find(
              v =>
                v.vehicle_type &&
                v.vehicle_type.toLowerCase() === "suv"
            ) ||
            vehicleList.find(
              v =>
                v.vehicle_type &&
                v.vehicle_type.toLowerCase() === "suv prime"
            );
          if (sedanOrHigher) updated.vehicle_type = sedanOrHigher.id;
        }
      }

      return updated;
    });
  };

  // Reusable fare fetch function
  const fetchFare = async () => {
    // Only fetch if all required fields are present
    if (
      !formData.customerId ||
      !formData.vehicle_type ||
      !formData.pickupLat ||
      !formData.dropLat ||
      !formData.autoCalc
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_API_URL}customers/checkFareAdmin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token
          },
          body: JSON.stringify(formData)
        }
      );

      const res = await response.json();

      if (res.success) {
        setData(res.data);

        // calculated silently, no snackbar needed on every auto-calc

      } else {
        // Optional: setErrorMessage(res.message); 
        // Avoiding aggressive error popups while typing/changing selections
        setData(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Auto-fetch effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFare();
    }, 500); // Debounce slightly to avoid too many calls

    return () => clearTimeout(timer);
  }, [
    formData.customerId,
    formData.vehicle_type,
    formData.pickupLat,
    formData.pickupLng,
    formData.dropLat,
    formData.dropLng,
    formData.autoCalc,
    formData.couponCode,
    formData.tripType,
    formData.trip_sub_type
  ]);

  // Handle manual submit if needed (removed button, but keeping logic safe or removing completely)
  const handleSubmit = async e => {
    e.preventDefault();
    await fetchFare();
  };


  const AssignDriverToTrip = async (tripId, driverId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/assignTripToDriver`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`
          },
          body: JSON.stringify({
            driverId: driverId,
            tripId: tripId
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        setSuccessMessage("Trip Created & Assigned Successfully!");
        setTimeout(() => router.push("/admin-trips"), 1000);
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Error while assigning driver.");
    }
  };



  // Confirm trip (works for both autoCalc & manual modes)
  const confirmTrip = async () => {
    if (!formData.customerId) {
      setErrorMessage("Please select a customer.");

      return;
    }

    if (!formData.driverId) {
      setErrorMessage("Please select a driver.");

      return;
    }

    let fareData;

    if (formData.autoCalc) {
      if (!data) {
        setErrorMessage("Please calculate fare first.");

        return;
      }

      const { gst, couponData, ...rest } = data; // removing backend unused fields
      fareData = rest;
    } else {
      if (!manualFare.km || !manualFare.total_fare) {
        setErrorMessage("Please enter KM and Total Fare in manual fare.");

        return;
      }

      fareData = {
        pickAddress: formData.pickup,
        dropAddress: formData.drop,
        km: Number(manualFare.km),
        price_per_km: Number(manualFare.price_per_km || 0),
        base_fare: Number(manualFare.base_fare || 0),
        additional_fare: Number(manualFare.additional_fare || 0),
        driverAllowance: Number(manualFare.driverAllowance || 0),
        tax: Number(manualFare.tax || 0),
        tollTax: Number(manualFare.tollTax || 0),
        discount: Number(manualFare.discount || 0),
        total_fare: Number(manualFare.total_fare || 0),
        trip_type: formData.tripType,
        trip_sub_type: formData.trip_sub_type
      };
    }

    const finalTripDate =
      formData.bookingType === "instant"
        ? dayjs().format("YYYY-MM-DD HH:mm:ss")
        : dayjs(tripDate).format("YYYY-MM-DD HH:mm:ss");

    const payload = {
      ...fareData,
      tripDate: finalTripDate,

      pickupLat: formData.pickupLat,
      pickupLng: formData.pickupLng,
      dropLat: formData.dropLat,
      dropLng: formData.dropLng,

      customerId: formData.customerId,

      trip_type: formData.tripType === "daily" ? 1 : formData.tripType === "outstation" ? 3 : 2,
      trip_sub_type: Number(formData.trip_sub_type),

      // autoCalc: formData.autoCalc,

      paymentType: formData.paymentMode === "cash" ? 1 : 2,

      // driverId: formData.driverId,
      couponCode: formData.couponCode,

      vehicle_type: Number(formData.vehicle_type),

      surge: 1,
      outstationPackageId: 0, // required by Joi
      fare: Number(fareData.total_fare),

      // Driver Payment Details
      amountGivenToDriver: Number(driverPayment.amountGiven),
      remainingAmountFromDriver: Number(driverPayment.remainingAmount),
      driverPaymentMethod: driverPayment.paymentMethod,
      isFromAdmin: true,
      driverId: Number(formData.driverId),

    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_API_URL}customers/confirmBookingAdmin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token
          },
          body: JSON.stringify(payload)
        }
      );

      const res = await response.json();

      if (!res.success) {
        setErrorMessage(res.message);

        return;
      }

      const newTripId = res.data.id;

      // 🚕 directly assign driver
      AssignDriverToTrip(newTripId, formData.driverId);

    } catch (err) {
      console.error(err);
      setErrorMessage("Error while creating trip.");
    }
  };



  // Load vehicle config
  useEffect(() => {
    if (!token) return;
    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/outstation-packageConfig`,
      { headers: { Authorization: token } }
    )
      .then(r => r.json())
      .then(res => setVehicleList(res.data?.vehicleList || []))
      .catch(() => setErrorMessage("Failed to load vehicles."));
  }, [token]);

  const renderDriverPaymentFields = () => (
    <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #e0e0e0" }}>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
        Driver Payment Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Amount Given to Driver"
            type="number"
            fullWidth
            value={driverPayment.amountGiven}
            onChange={e =>
              setDriverPayment(prev => ({
                ...prev,
                amountGiven: e.target.value
              }))

            }
            required
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Remaining Amount"
            type="number"
            fullWidth
            value={driverPayment.remainingAmount}
            required
            InputProps={{
              readOnly: true
            }}
            helperText="Auto-calculated (Total - Given)"
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Payment Method</InputLabel>
            <Select
              required
              value={driverPayment.paymentMethod}
              label="Payment Method"
              onChange={e =>
                setDriverPayment(prev => ({
                  ...prev,
                  paymentMethod: e.target.value
                }))
              }
            >
              <MenuItem value="wallet">Wallet Deduction</MenuItem>
              <MenuItem value="upi">UPI</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Card sx={{ p: 3, borderRadius: 3, boxShadow: 4 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Create Manual Trip
      </Typography>

      <LoadScript
        googleMapsApiKey={'AIzaSyA3GfFqfSjITAXoeaK_kDce__LJa8iCK7M'}
        libraries={["places"]}
      >
        <Grid container spacing={4}>
          {/* LEFT FORM */}
          <Grid item xs={12} md={5}>
            {/* Customer & Driver selection */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<PersonIcon />}
                onClick={() => setCustomerDrawerOpen(true)}
              >
                Select Customer
              </Button>

              <Button
                variant="contained"
                color="secondary"
                startIcon={<LocalTaxiIcon />}
                onClick={() => setDriverDrawerOpen(true)}
              >
                Select Driver
              </Button>
            </Stack>

            {selectedCustomer && (
              <Card sx={{ p: 2, mb: 2 }}>
                <Typography fontWeight="bold">Customer</Typography>
                <Typography>{selectedCustomer.first_name}</Typography>
                <Typography>{selectedCustomer.phone_number}</Typography>
              </Card>
            )}

            {selectedDriver && (
              <Card sx={{ p: 2, mb: 2 }}>
                <Stack direction="row" spacing={2}>
                  <Avatar src={selectedDriver.driverProfile} />
                  <Box>
                    <Typography fontWeight="bold">Driver</Typography>
                    <Typography>{selectedDriver.driverName || "N/A"}</Typography>
                    <Typography>{selectedDriver.phone_number}</Typography>
                  </Box>
                </Stack>
              </Card>
            )}

            {/* Pickup */}
            <Autocomplete
              onLoad={ref => setPickupRef(ref)}
              onPlaceChanged={() =>
                handlePlaceSelect(pickupRef.getPlace(), "pickup")
              }
              options={{
                componentRestrictions: { country: "in" }
              }}
            >
              <TextField
                label="Source (Pickup Location)"
                fullWidth
                required
                sx={{ mb: 2 }}
              />
            </Autocomplete>


            {/* Drop */}
            <Autocomplete
              onLoad={ref => setDropRef(ref)}
              onPlaceChanged={() =>
                handlePlaceSelect(dropRef.getPlace(), "drop")
              }
              options={{
                componentRestrictions: { country: "in" }
              }}
            >
              <TextField
                label="Destination (Drop Location)"
                fullWidth
                required
                sx={{ mb: 2 }}
              />
            </Autocomplete>


            {/* Distance + trip type info */}
            {distanceKm !== null && (
              <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
                Distance: <strong>{distanceKm} km</strong> — Trip Type:&nbsp;
                <strong>
                  {formData.tripType === "daily" ? "Daily (Local)" : "Outstation"}
                </strong>
              </Typography>
            )}

            {/* Booking Type */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Booking Type</InputLabel>
              <Select
                name="bookingType"
                value={formData.bookingType}
                label="Booking Type"
                onChange={handleChange}
              >
                <MenuItem value="instant">Instant (Current Time)</MenuItem>
                <MenuItem value="schedule">Schedule (Date & Time)</MenuItem>
              </Select>
            </FormControl>

            {formData.bookingType === "schedule" && (
              <Box sx={{ mb: 2 }}>
                <CommonDatePicker
                  type="datetime"
                  label="Schedule Date & Time"
                  value={tripDate}
                  onChange={settripDate}
                />
              </Box>
            )}

            {/* Trip Type (Daily / Outstation) */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Trip Type</InputLabel>
              <Select
                name="tripType"
                value={formData.tripType}
                label="Trip Type"
                onChange={handleChange}
                disabled
              >
                <MenuItem value="daily">Daily (Local)</MenuItem>
                <MenuItem value="outstation">Outstation</MenuItem>
              </Select>
              <FormHelperText>
                Auto-selected from distance (Daily: {'\u2264'}25 km, Outstation: {'\u003e'}25 km)
              </FormHelperText>
            </FormControl>

            {/* AutoCalc Checkbox */}
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.autoCalc}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        autoCalc: e.target.checked
                      }))
                    }
                  />
                }
                label="Auto calculation (from package/base)"
              />
              <FormHelperText>
                When checked, fare is calculated from package/base using API.
                When unchecked, enter fare manually on the right.
              </FormHelperText>
            </Box>

            {/* Vehicle Selection */}
            <FormControl
              fullWidth
              sx={{ mb: 2 }}
              error={!!formErrors.vehicle_type}
            >
              <InputLabel>Vehicle Type</InputLabel>
              <Select
                name="vehicle_type"
                value={formData.vehicle_type}
                label="Vehicle Type"
                onChange={handleChange}
              >
                {vehicleList.map(v => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.vehicle_type}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.vehicle_type && (
                <FormHelperText>{formErrors.vehicle_type}</FormHelperText>
              )}
              <FormHelperText>
                Hatchback for below 125 km; Sedan / SUV / SUV Prime for longer
                trips.
              </FormHelperText>
            </FormControl>

            {/* Payment Mode */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Payment Mode</InputLabel>
              <Select
                name="paymentMode"
                value={formData.paymentMode}
                label="Payment Mode"
                onChange={handleChange}
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="online">Online</MenuItem>
              </Select>
            </FormControl>

            {/* Coupon */}
            <TextField
              name="couponCode"
              label="Coupon Code (Optional)"
              fullWidth
              sx={{ mb: 2 }}
              value={formData.couponCode}
              onChange={handleChange}
            />

            {/* Check Fare button only useful in autoCalc mode */}
            {/* Button Removed: Auto calculation happens automatically via useEffect */}
          </Grid>

          {/* RIGHT: Trip Summary / Manual Fare */}
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 3, background: "#f9f9f9" }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Trip Summary & Fare
              </Typography>

              {formData.autoCalc ? (
                <>
                  {data ? (
                    <>
                      <Typography>
                        <strong>Pick Address:</strong> {data.pickAddress}
                      </Typography>
                      <Typography>
                        <strong>Drop Address:</strong> {data.dropAddress}
                      </Typography>
                      <Typography>
                        <strong>Total KM:</strong> {data.km} km
                      </Typography>
                      <Typography>
                        <strong>Base Fare:</strong> ₹{data.base_fare}
                      </Typography>
                      <Typography>
                        <strong>Additional Fare:</strong> ₹{data.additional_fare}
                      </Typography>
                      <Typography>
                        <strong>Driver Allowance:</strong> ₹{data.driverAllowance}
                      </Typography>
                      <Typography>
                        <strong>Tax:</strong> ₹{data.tax}
                      </Typography>
                      <Typography>
                        <strong>Toll Tax:</strong> ₹{data.tollTax}
                      </Typography>
                      <Typography>
                        <strong>Discount:</strong> ₹{data.discount}
                      </Typography>
                      <Typography sx={{ mt: 1 }} variant="h6">
                        Total Fare: ₹{data.total_fare}
                      </Typography>

                      {renderDriverPaymentFields()}

                      <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        sx={{ mt: 3 }}
                        onClick={confirmTrip}
                      >
                        Confirm & Create Trip
                      </Button>
                    </>
                  ) : (
                    <Typography color="text.secondary">
                      No fare available yet. Ensure "Auto calculation" is ON and all fields (Customer, Vehicle, Locations) are selected.
                    </Typography>
                  )}
                </>
              ) : (
                <>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Manual Fare (Auto calculation is OFF)
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Total KM"
                        type="number"
                        fullWidth
                        value={manualFare.km}
                        onChange={e =>
                          setManualFare(prev => ({
                            ...prev,
                            km: e.target.value
                          }))
                        }
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Price per KM"
                        type="number"
                        fullWidth
                        value={manualFare.price_per_km}
                        onChange={e =>
                          setManualFare(prev => ({
                            ...prev,
                            price_per_km: e.target.value
                          }))
                        }
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        label="Base Fare"
                        type="number"
                        fullWidth
                        value={manualFare.base_fare}
                        onChange={e =>
                          setManualFare(prev => ({
                            ...prev,
                            base_fare: e.target.value
                          }))
                        }
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Additional Fare"
                        type="number"
                        fullWidth
                        value={manualFare.additional_fare}
                        onChange={e =>
                          setManualFare(prev => ({
                            ...prev,
                            additional_fare: e.target.value
                          }))
                        }
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        label="Driver Allowance"
                        type="number"
                        fullWidth
                        value={manualFare.driverAllowance}
                        onChange={e =>
                          setManualFare(prev => ({
                            ...prev,
                            driverAllowance: e.target.value
                          }))
                        }
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Tax"
                        type="number"
                        fullWidth
                        value={manualFare.tax}
                        onChange={e =>
                          setManualFare(prev => ({
                            ...prev,
                            tax: e.target.value
                          }))
                        }
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <TextField
                        label="Toll Tax"
                        type="number"
                        fullWidth
                        value={manualFare.tollTax}
                        onChange={e =>
                          setManualFare(prev => ({
                            ...prev,
                            tollTax: e.target.value
                          }))
                        }
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Discount"
                        type="number"
                        fullWidth
                        value={manualFare.discount}
                        onChange={e =>
                          setManualFare(prev => ({
                            ...prev,
                            discount: e.target.value
                          }))
                        }
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Total Fare"
                        type="number"
                        fullWidth
                        value={manualFare.total_fare}
                        onChange={e =>
                          setManualFare(prev => ({
                            ...prev,
                            total_fare: e.target.value
                          }))
                        }
                      />
                    </Grid>
                  </Grid>

                  {/* Driver Payment Section */}
                  {renderDriverPaymentFields()}

                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    sx={{ mt: 3 }}
                    onClick={confirmTrip}
                  >
                    Create Trip (Manual Fare)
                  </Button>
                </>
              )}
            </Card>
          </Grid>
        </Grid>
      </LoadScript>

      {/* Snackbars */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <MuiAlert elevation={6} variant="filled" severity="error">
          {errorMessage}
        </MuiAlert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <MuiAlert elevation={6} variant="filled" severity="success">
          {successMessage}
        </MuiAlert>
      </Snackbar>

      {/* Drawers */}
      <CustomerSearchDrawer
        open={customerDrawerOpen}
        onClose={() => setCustomerDrawerOpen(false)}
        onSelectCustomer={customer => {
          setSelectedCustomer(customer);
          setFormData(prev => ({ ...prev, customerId: customer.id }));
        }}
      />

      <DriverSearchDrawer
        open={driverDrawerOpen}
        onClose={() => setDriverDrawerOpen(false)}
        onSelectDriver={driver => {
          setSelectedDriver(driver);
          setFormData(prev => ({ ...prev, driverId: driver.id }));
        }}
      />
    </Card>
  );
};

export default AddMenualTrip;
