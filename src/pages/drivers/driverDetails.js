import React, { useState, useEffect } from "react";
import { Container, Grid, Card, CardContent, Avatar, Typography, Tabs, Tab, Box } from "@mui/material";
import { useRouter } from 'next/router';

const DriverDetails = ({  }) => {
     const router = useRouter();
    const { id } = router.query; // Get driver ID from query params
    const [formData, setFormData] = useState({});
    const [approvalStatus, setApprovalStatus] = useState({});
    const [tabIndex, setTabIndex] = useState(0);
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    useEffect(() => {
        fetchDriverDetails();
    }, []);

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
    
                    if (data.data.documents && data.data.documents.length > 0) {
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
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching driver details:', error);
            });
        }
    };

    return (
        <Container maxWidth="lg">
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent style={{ textAlign: "center" }}>
                            <Avatar
                                src={formData.driverProfile}
                                alt="Driver Profile"
                                sx={{ width: 120, height: 120, margin: "auto" }}
                            />
                            <Typography variant="h6" sx={{ mt: 2 }}>{formData.driverName}</Typography>
                            <Typography variant="body2" color="textSecondary">{formData.email}</Typography>
                            <Typography variant="body2" color="textSecondary">{formData.phone_number}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)}>
                        <Tab label="Driver Profile" />
                        <Tab label="Vehicle Document" />
                        <Tab label="Driver Document" />
                    </Tabs>
                    <Box sx={{ p: 2 }}>
                        {tabIndex === 0 && (
                            <Typography variant="body1">Driver Profile Details</Typography>
                        )}
                        {tabIndex === 1 && (
                            <Typography variant="body1">Vehicle Document Details</Typography>
                        )}
                        {tabIndex === 2 && (
                            <Typography variant="body1">Driver Document Details</Typography>
                        )}
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default DriverDetails;
