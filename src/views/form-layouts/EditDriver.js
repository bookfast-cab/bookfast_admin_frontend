import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, Box ,Button} from '@mui/material';

import { useRouter } from 'next/router';
import { CONNECTING } from 'ws';
import { Avatar } from "@mui/material";



const EditDriverDetails = () => {
    const router = useRouter();
    const { id } = router.query; // Get driver ID from query params
    const [successMessage, setSuccessMessage] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [vehicleCategories, setVehicleCategories] = useState([]);
    const [cities, setCities] = useState([]);
    
    const [errors, setErrors] = useState({
            phone_number: '',
            email: '',
        }); 

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
        
        setSuccessMessage("");
    };

    const [approvalStatus, setApprovalStatus] = useState({
        aadharCardImage: 0,
        aadharCardBackImage: 0,
        bankPassbookImage: 0,
        licenseBackImage: 0,
        licenseFrontImage: 0,
        panCardImage: 0,
        vehicleBackImage: 0,
        vehicleFrontImage: 0,
        vehicleInsurance: 0,
        vehiclePermitNational: 0,
        vehicleRcBackImage: 0,
        vehicleRcFrontImage: 0,
    });

    const [selectedProfilePicture, setSelectedProfilePicture] = useState(null);

    const [selectedFiles, setSelectedFiles] = useState({});
    const [imageExists, setImageExists] = useState({});

    


    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedProfilePicture(file);
        }
    };

    const handleProfilePictureUpload = async () => {
        if (!selectedProfilePicture) return;

        const formData = new FormData();
        formData.append('profilePicture', selectedProfilePicture);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/drivers/${id}/profile/upload`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (data.success) {
                setSuccessMessage('Profile picture uploaded successfully');
                setOpenSnackbar(true);
                fetchDriverDetails(); // Refresh details after upload
            } else {
                console.error('Error uploading profile picture:', data);
            }
        } catch (error) {
            console.error('Profile picture upload failed', error);
        }
    };

    const handleApprovalChange = (imageName, value) => {
        const updatedStatus = {
            ...approvalStatus,
            [imageName]: value,
        };
    
        setApprovalStatus(updatedStatus); // Update state
        updateDocumentApproval(id, updatedStatus); // Pass the updated value directly
    };

    const handleDownloadClick =async (imageUrl,imageName) => {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = imageName || 'downloaded_image';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    }

    const handlePhoneNumberChange = (e) => {
        const value = e.target.value;
        setFormData({ ...formData, phone_number: value });
    
        // Validate phone number (example: 123-456-7890 or 123 456 7890)
        const phoneRegex = /^[0-9]{3}[-\s]?[0-9]{3}[-\s]?[0-9]{4}$/;
        if (!phoneRegex.test(value)) {
          setErrors({ ...errors, phone_number: 'Invalid phone number format' });
        } else {
          setErrors({ ...errors, phone_number: '' });
        }
      };
    
      const handleEmailChange = (e) => {
        const value = e.target.value;
        setFormData({ ...formData, email: value });
    
        // Validate email (simple email regex)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value)) {
          setErrors({ ...errors, email: 'Invalid email format' });
        } else {
          setErrors({ ...errors, email: '' });
        }
    };

    const handleProfileApprovalChange = async(status) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/drivers/${id}/profile/approve`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${token}`,
                    },
                    body: JSON.stringify({
                        id, status
                    }),
                }
            );
    
            const data = await response.json();
    
            if (response.ok) {
                setFormData((prev)=>({
                    ...prev,
                    profileApproved : status
                }))
                setSuccessMessage('Profile approval status updated successfully');
            } else {
                console.error('Error updating approval status:', data);
            }
        } catch (error) {
            console.error('Request failed', error);
        }
    }
    
    const updateDocumentApproval = async (driverId, approvalData) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/drivers/${driverId}/documents/approve`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `${token}`,
                    },
                    body: JSON.stringify(approvalData),
                }
            );
    
            const data = await response.json();
    
            if (response.ok) {
                setSuccessMessage('Document approval status updated successfully');
            } else {
                console.error('Error updating approval status:', data);
            }
        } catch (error) {
            console.error('Request failed', error);
        }
    };
    

    const [formData, setFormData] = useState({
        driverName: '',
        country_id: 2,
        phone_number: '',
        email: '',
        drivingLicenseNumber: '',
        vehicleRcNo: '',
        ownerName: '',
        ownerMobileNo: '',
        cabAttachmentCity: '',
        cabCategory: '',
        remarks: '',
        driverProfile: '',
        profileApproved : ''
    });

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

   const fetchDriverDetails = () => {
    if (id) {
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/driver/${id}`, {
            headers: {
                Authorization: `${token}`,
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                setFormData({
                    driverName: data?.data.driverName || '',
                    country_id: data?.data.country_id || 2,
                    phone_number: data?.data.phone_number || '',
                    email: data?.data.email || '',
                    drivingLicenseNumber: data?.data.drivingLicenseNumber || '',
                    vehicleRcNo: data?.data.vehicleRcNo || '',
                    ownerName: data?.data.ownerName || '',
                    ownerMobileNo: data?.data.ownerMobileNo || '',
                    cabAttachmentCity: data?.data.cabAttachmentCity || '',
                    cabCategory: data?.data.cabCategory || '',
                    remarks: data?.data.remarks || '',
                    driverProfile: `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/driver_profiles/${data?.data.driverProfile || '' }`,
                    profileApproved: data?.data.profileApproved || 0,
                });

                // Check if documents array exists and has at least one object
                if (data.data.documents && data.data.documents.length > 0 && data.data.documents[0]) {
                    const doc = data.data.documents[0];
                    setApprovalStatus({
                        aadharCardImage: doc.isAadharCardApproved || false,
                        aadharCardBackImage: doc.isAadharCardBackApproved || false,
                        bankPassbookImage: doc.isBankPassbookApproved || false,
                        licenseBackImage: doc.isLicenseBackApproved || false,
                        licenseFrontImage: doc.isLicenseFrontApproved || false,
                        panCardImage: doc.isPanCardApproved || false,
                        vehicleBackImage: doc.isVehicleBackApproved || false,
                        vehicleFrontImage: doc.isVehicleFrontApproved || false,
                        vehicleInsurance: doc.isVehicleInsuranceApproved || 0,
                        vehiclePermitNational: doc.isVehiclePermitNationalApproved || 0,
                        vehicleRcBackImage: doc.isVehicleRcBackApproved || false,
                        vehicleRcFrontImage: doc.isVehicleRcFrontApproved || false,
                    });
                } else {
                    console.warn("No documents available or invalid data structure.");
                }
            }
        })
        .catch(error => {
            console.error('Error fetching driver details:', error);
        });
    }
};


    useEffect(() => {
        fetchDriverDetails();
        fetchVehicleCategories();
    }, [id, token]);

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        if (errors.phone_number || errors.email) {
            return;
          }
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/drivers/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `${token}`,
                },
                body: JSON.stringify(formData), // Send updated form data
            });
    
            const data = await response.json();
    
            if (data.success) {
                setSuccessMessage('Driver details updated successfully');
                setOpenSnackbar(true);
            } else {
                console.error('Error updating driver details:', data);
            }
        } catch (error) {
            console.error('Request failed', error);
        }
    };
    

    const fetchVehicleCategories = async() => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/get-vehicle-categories`, {
                headers: {
                    Authorization: `${token}`,
                },
            });
            const data = await response.json();

            if (data.success) {
                setVehicleCategories(data.data);
                setCities(data.cities);
            }
        } catch (error) {
            console.error('Error fetching vehicle categories:', error);
        }
    }

    const handleFileChange = (imageName, file) => {
        setSelectedFiles((prev) => ({
            ...prev,
            [imageName]: file,
        }));
    };
    
    const handleFileUpload = async (imageName) => {
        const file = selectedFiles[imageName];
        if (!file) return;
    
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', imageName);
    
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/drivers/${id}/documents/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `${token}`,
                },
                body: formData,
            });
    
            const data = await response.json();
            if (data.success) {
                setSuccessMessage(`${imageName} uploaded successfully`);
                setOpenSnackbar(true);
                fetchDriverDetails();
                setSelectedFiles((prev) => ({ ...prev, [imageName]: null }));
            } else {
                console.error('Error uploading file:', data);
            }
        } catch (error) {
            console.error('File upload failed', error);
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6">Edit Driver Details</Typography>
                <form onSubmit={handleSubmit}>
                <Box sx={{ mt: 4 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1">Profile Picture</Typography>
                            <Box>
                            <Avatar
                                src={
                                    selectedProfilePicture
                                        ? URL.createObjectURL(selectedProfilePicture)
                                        : `https://service.bookfast.in/driverProfilePic/${id}.jpg`
                                }
                                onError={(e) => { e.target.onerror = null; e.target.src = "/path-to-default-user-icon.png"; }}
                                alt="Profile"
                                sx={{ width: 100, height: 100 }}
                            />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    disabled={!selectedProfilePicture}
                                    onClick={handleProfilePictureUpload}
                                    >
                                    Upload
                                </Button>
                                <Button variant="outlined" component="label">
                                    Select File
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleProfilePictureChange}
                                        />
                                </Button>
                            </Box>
                            <br/>
                        </Grid>

                        {/* Driver Name */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Driver Name"
                                value={formData.driverName}
                                fullWidth
                                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                            />
                        </Grid>

                        {/* Country */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant="outlined"> {/* Wrap Select with FormControl */}
                                <InputLabel id="country">Country</InputLabel>
                                <Select
                                    labelId="country" // Links InputLabel to Select
                                    value={formData.country_id || 2}
                                    onChange={(e) => setFormData({ ...formData, country_id: e.target.value })} // Update state on change
                                    label="Country" // This makes the label float properly
                                >
                                    <MenuItem value="">Country</MenuItem> {/* Default placeholder */}
                                    <MenuItem value={1}>Switzerland</MenuItem>
                                    <MenuItem value={2}>India</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Phone */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Phone Number"
                                value={formData.phone_number}
                                fullWidth
                                onChange={handlePhoneNumberChange}
                                required
                                error={!!errors.phone_number}
                                helperText={errors.phone_number}
                            />
                        </Grid>

                        {/* Email */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Email"
                                value={formData.email}
                                fullWidth
                                onChange={handleEmailChange}
                                required
                                error={!!errors.email}
                                helperText={errors.email}
                            />
                        </Grid>

                        {/* Driving License Number */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Driving License Number"
                                value={formData.drivingLicenseNumber}
                                fullWidth
                                onChange={(e) => setFormData({ ...formData, drivingLicenseNumber: e.target.value })}
                            />
                        </Grid>

                        {/* Vehicle RC Number */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Vehicle RC Number"
                                value={formData.vehicleRcNo}
                                fullWidth
                                onChange={(e) => setFormData({ ...formData, vehicleRcNo: e.target.value })}
                            />
                        </Grid>

                        {/* Owner Name */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Owner Name"
                                value={formData.ownerName}
                                fullWidth
                                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                            />
                        </Grid>

                        {/* Owner Mobile Number */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Owner Mobile Number"
                                variant="outlined" // Set the variant to 'outlined'
                                value={formData.ownerMobileNo}
                                fullWidth
                                onChange={(e) => setFormData({ ...formData, ownerMobileNo: e.target.value })}
                            />
                        </Grid>

                        {/* Cab Attachment City */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant="outlined"> {/* Wrap Select with FormControl */}
                                <InputLabel id="cab-attachment-city-label">Cab Attachment City</InputLabel>
                                <Select
                                    labelId="cab-attachment-city-label" // Links InputLabel to Select
                                    value={formData.cabAttachmentCity || ''}
                                    onChange={(e) => setFormData({ ...formData, cabAttachmentCity: e.target.value })} // Update state on change
                                    label="Cab Attachment City" // This makes the label float properly
                                >
                                    <MenuItem value="">Select city</MenuItem> {/* Default placeholder */}
                                    {cities && cities.map((city) => (
                                        <MenuItem key={city.id} value={city.id}>
                                            {city.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Cab Category */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant="outlined"> {/* Wrap Select with FormControl */}
                                <InputLabel id="cab-category-label">Cab Category</InputLabel>
                                <Select
                                    labelId="cab-category-label" // Links InputLabel to Select
                                    value={formData.cabCategory || ''}
                                    onChange={(e) => setFormData({ ...formData, cabCategory: e.target.value })} // Update state on change
                                    label="Cab Category" // Ensures the label floats properly
                                >
                                    <MenuItem value="">Select Cab Category</MenuItem> {/* Default placeholder */}
                                    {vehicleCategories && vehicleCategories.map((category) => (
                                        <MenuItem key={category.id} value={category.id}>
                                            {category.vehicle_type}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>



                        {/* Remarks */}
                        <Grid item xs={12}>
                            <TextField
                                label="Remarks"
                                value={formData.remarks}
                                fullWidth
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Select
                                fullWidth
                                value={formData.profileApproved} // Get approval status for this image
                                displayEmpty
                                sx={{ mt: 2 }}
                                onChange={(e) => handleProfileApprovalChange( e.target.value)} // Update the approval state
                            >
                                <MenuItem value="">Select</MenuItem>
                                <MenuItem value={1}>Approved</MenuItem>
                                <MenuItem value={2}>Unapproved</MenuItem>
                                <MenuItem value={3}>Blocked</MenuItem>
                                <MenuItem value={4}>Rejected</MenuItem>
                            </Select>
                        </Grid>
                     
                        {/* documents image   */}

<TableContainer component={Paper}>
    <Table>
        <TableHead>
            <TableRow>
                <TableCell><strong>Document</strong></TableCell>
                <TableCell><strong>Image</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
                <TableCell><strong>Approval</strong></TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {[
                'aadharCardImage.jpg',
                'aadharCardBackImage.jpg',
                'licenseBackImage.jpg',
                'licenseFrontImage.jpg',
                'panCardImage.jpg',
                'vehicleBackImage.jpg',
                'vehicleFrontImage.jpg',
                'vehicleInsurance.jpg',
                'vehiclePermitNational.jpg',
                'vehicleRcBackImage.jpg',
                'vehicleRcFrontImage.jpg'
            ].map((imageName, index) => {
                const imageUrl = `https://bookfast-service.s3.ap-south-1.amazonaws.com/drivers/${id}/${imageName}`;
                const file = selectedFiles[imageName];
                const previewUrl = file ? URL.createObjectURL(file) : imageUrl;

                return (
                    <TableRow key={index}>
                        {/* Image Name & Preview */}
                        <TableCell>
                        <Typography >
                                <strong>{imageName.replace(/([A-Z])/g, ' $1').replace('.jpg', '')}</strong>
                            </Typography>
                        </TableCell>
                        <TableCell sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
    <Box>
        <img
            src={previewUrl}
            alt={imageName}
            style={{ width: '150px', height: '100px', objectFit: 'contain' }}
            onLoad={() => setImageExists((prev) => ({ ...prev, [imageName]: true }))}
            onError={(e) => {
                e.target.src = '/image_not_found.png';
                setImageExists((prev) => ({ ...prev, [imageName]: false }));
            }}
            onClick={() => {
                const newTab = window.open(imageUrl, '_blank');
                newTab.document.write(`
                    <html>
                        <head><title>BookFast ${imageName}</title></head>
                        <body>
                            <h1>${imageName}</h1><span><a href="${imageUrl}">Download</a></span>
                            <img src="${imageUrl}" alt="${imageName}" style="max-width: 100%; height: auto;" />
                        </body>
                    </html>
                `);

                // Close the document writing process (important for the content to render)
                newTab.document.close();
            }}
        />
    </Box>
    
    <Box sx={{ display: 'flex', gap: 2, marginTop: 2, justifyContent: 'center' }}>
    <Button
            variant="outlined"
            component="label"
        >
            Select File
            <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => handleFileChange(imageName, e.target.files[0])}
            />
        </Button>
        <Button
            variant="outlined"
            color="primary"
            disabled={!file}
            onClick={() => handleFileUpload(imageName)}
        >
            Upload
        </Button>

       
    </Box>
</TableCell>


                        {/* Actions Column */}
                        <TableCell>
                          

                            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    disabled={!imageExists[imageName]}
                                    onClick={() => {
                                        const newTab = window.open(imageUrl, '_blank');
                                        newTab.document.write(`
                                            <html>
                                                <head><title>BookFast ${imageName}</title></head>
                                                <body>
                                                    <h1>${imageName}</h1><span><a href="${imageUrl}">Download</a></span>
                                                    <img src="${imageUrl}" alt="${imageName}" style="max-width: 100%; height: auto;" />
                                                </body>
                                            </html>
                                        `);

                                        // Close the document writing process (important for the content to render)
                                        newTab.document.close();
                                    }}
                                >
                                    View
                                </Button>

                                <Button
                                    variant="outlined"
                                    color="primary"
                                    disabled={!imageExists[imageName]}
                                    onClick={() => handleDownloadClick(imageUrl, imageName)}
                                >
                                    Download
                                </Button>
                            </Box>
                        </TableCell>

                        {/* Approval Status */}
                        <TableCell>
                            <Select
                                fullWidth
                                value={approvalStatus[imageName.replace('.jpg', '')] || 2}
                                displayEmpty
                                sx={{ mt: 2 }}
                                onChange={(e) => handleApprovalChange(imageName.replace('.jpg', ''), e.target.value)}
                            >
                                <MenuItem value="">Select</MenuItem>
                                <MenuItem value={1}>Approved</MenuItem>
                                <MenuItem value={2}>Unapproved</MenuItem>
                            </Select>
                        </TableCell>
                    </TableRow>
                );
            })}
        </TableBody>
    </Table>
</TableContainer>

                       {/* documents image */}

                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit" // Triggers the form submission
                                fullWidth
                                sx={{ mt: 3 }}

                            >
                                Save Changes
                            </Button>
                        </Grid>


                    </Grid>
                </Box>
                </form>
                {/* Snackbar for Success */}
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
            </CardContent>
        </Card>
    );
};

export default EditDriverDetails;
