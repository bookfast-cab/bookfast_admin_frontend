"use client";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useState, useEffect } from "react";
import {
  FormControl,
  MenuItem,
  Select,
  ListSubheader,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Checkbox,
  ListItemText,
  List,
  Button
} from "@mui/material";

const StaffTable = () => {
  const [data, setData] = useState([]);
  const [privilegeList, setprivilegeList] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [token, setToken] = useState(null);
  const [staffId, setStaffId] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("access_token"));
    }
  }, []);

  useEffect(() => {
    if (token) {
      getStaffs();
    }
  }, [token]);


    const selectprivilegeItem = (item) => {
        let selectedprivilege = [...privilegeList];

        let index = selectedprivilege.indexOf(item);

        if (index === -1) {
            selectedprivilege.push(item);
        } else {
            selectedprivilege.splice(index, 1);
        }
        setprivilegeList(selectedprivilege); 
    }
    

  const handleCloseSnackbar = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const updateStaffprivilege = () =>{
    if (!token) return;
    
    if(!staffId) {
        setErrorMessage("Please Select Staff");

        return;
    }


    let params = {
        staff_id:staffId,
        privilegeList : privilegeList
    }
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/update-staff-privilege`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(params),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to update staff privilege. Status: ${response.status}`);
        } else {
            setSuccessMessage("Staff Updated Successfully");
        }

        return response.json();
      })
      .then((result) => {
            if(result?.success){
                const updatedList = data.map((item) => {
                    if (item.id == params?.staff_id) {
                        return { ...item, privilege: JSON.stringify(params?.privilegeList) };
                    }
                    
                    return item;
                });

                // console.log(updatedList);
                setData(updatedList);
            }
      })
      .catch((error) => {
        setErrorMessage("Failed to update staff privilege data.");
        console.error(error);
      });
  }

  const getStaffs = () => {
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/staff`, {
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
      })
      .catch((error) => {
        setErrorMessage("Failed to fetch staff data.");
        console.error(error);
      });
  };

 const allMenuItems = [

  // Dashboard & Dispatch

  { type: 'header', title: 'Dashboard' },
  { id: 'dashboard', type: 'item', title: 'Dashboard' },
  { id: 'dispatch', type: 'item', title: 'Dispatch' },
  
  // Customers Management
  
  { type: 'header', title: 'Customers Management' },
  { id: 'customers', type: 'item', title: 'Customers' },
  { id: 'promo-coupon', type: 'item', title: 'Promo Coupon' },
  
  // Drivers Management
  
  { type: 'header', title: 'Drivers Management' },
  { id: 'drivers', type: 'item', title: 'Drivers' },
  { id: 'driver-wallet-history', type: 'item', title: 'Driver Wallet History' },
  
  // Trips Management
  
  { type: 'header', title: 'Trips Management' },
  { id: 'trips', type: 'item', title: 'Trips' },
  { id: 'manual-trips', type: 'item', title: 'Manual Trips' },
  
  // Chat
  
  { type: 'header', title: 'Chat' },
  { id: 'driver-chat', type: 'item', title: 'Driver Chat' },
  
  // Zone Management
  
  { type: 'header', title: 'Zone Management' },
  { id: 'zone', type: 'item', title: 'Zone' },
  
  // Notification Management
  
  { type: 'header', title: 'Notification Management' },
  { id: 'advance-booking', type: 'item', title: 'Advance Booking' },
  { id: 'common-notifications',type: 'item',title: 'Common Notifications',},
  { id: 'trip-notification',type: 'item',title: 'Trip Notification',},
  
  // Payment
  
  { type: 'header', title: 'Payment' },
  { id: 'payment-management', type: 'item', title: 'Payment Management' },
  { id: 'admin-earning', type: 'item', title: 'Admin Earning' },
  
  // Settings
  
  { type: 'header', title: 'Settings' },
  { id: 'cities-setup', type: 'item', title: 'Cities Setup' },
  { id: 'whatsapp-setup', type: 'item', title: 'WhatsApp Setup' },
  { id: 'force-app-update', type: 'item', title: 'Force App Update' },
  { id: 'helpline-numbers', type: 'item', title: 'Helpline Numbers' },
  { id: 'whatsapp-keywords', type: 'item', title: 'WhatsApp Keywords' },
  
  // Fare Management
  
  { type: 'header', title: 'Fare Management' },
  { id: 'outstation-package', type: 'item', title: 'Outstation Package' },
  { id: 'outstation-fare', type: 'item', title: 'Outstation Fare' },
  { id: 'daily-fare-management', type: 'item', title: 'Daily Fare Management' },
  { id: 'package', type: 'item', title: 'Package' },
  
  // Website Pages
  
  { type: 'header', title: 'Website Pages' },
  { id: 'view-bookings', type: 'item', title: 'View Bookings' },
  { id: 'add-one-way-trip', type: 'item', title: 'Add One Way Trip' },
  { id: 'view-trips', type: 'item', title: 'View Trips' },
  { id: 'add-package', type: 'item', title: 'Add Package' },
  { id: 'view-package', type: 'item', title: 'View Package' },
  
  // Staff Management
  
  { type: 'header', title: 'Staff Management' },
  { id: 'staff-members', type: 'item', title: 'Staff Members' },
  { id: 'staff-privilege', type: 'item', title: 'Staff Privilege' },
  
  // Blogs
  
  { type: 'header', title: 'Blogs' },
  { id: 'add-blog', type: 'item', title: 'Add Blog' },
  { id: 'view-blogs', type: 'item', title: 'View Blogs' },
];


  return (
    <Grid container spacing={4} sx={{ bgcolor: "white", padding: 3 }}>
      <Grid item xs={12}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1976d2" }}>
              Set Staff Privilege
            </Typography>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
            <div style={{ width: "100%", overflowX: "auto",paddingTop:'10px' }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <h3> Select Staff</h3>
                    <Button
                        style={{height:40}}
                        variant="contained"
                        color="primary"
                        type="submit"
                        onClick={()=>{updateStaffprivilege()}}
                    >
                        Submit
                    </Button>
                </div>
                <FormControl fullWidth>
                    <Select
                        displayEmpty 
                        inputProps={{ 'aria-label': 'Without label' }}
                        onChange={(event,child)=>{
                                setStaffId(event?.target?.value)
                                if(event?.target?.value && child?.props?.privilege){
                                    setprivilegeList(JSON.parse(child.props.privilege))
                                }
                            }
                        }
                        >
                        <MenuItem value="">
                            <em style={{ color: '#aaa' }}>Select Staff</em>
                        </MenuItem>
                        {data?.map((v,i)=>(
                            (v.userRole != 'admin') && <MenuItem privilege={v.privilege} key={v.id} value={v.id}>{v.name} - {v.email}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <div>
                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {staffId && 
                        <ListSubheader sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }} style={{display:'flex',justifyContent:'space-between'}}>
                            
                            <div>
                                <span style={{marginRight:"5px"}}>Select All </span>  
                                <Checkbox edge="start" onChange={({target})=>{
                                    if(target.checked){
                                        let privilegeitems = allMenuItems?.filter((v) => v.type !== 'header').map((v) => v.id);
                                        setprivilegeList(privilegeitems);
                                    } else {
                                        setprivilegeList([]);
                                    }

                                }} checked={privilegeList.length === (allMenuItems?.length - 13)} tabIndex={-1} disableRipple />
                            </div>
                            <div>
                                {(privilegeList?.length > 0) && `( ${privilegeList?.length} Item Selected )`}
                            </div> 
                        </ListSubheader>
                    }
                    {staffId && allMenuItems.map((item) => {
                    
                        if (item.type === 'header') {
                            return (
                            <ListSubheader key={item.id} sx={{ bgcolor: '#f5f5f5', fontWeight: 'bold' }}>
                                {item.title}
                            </ListSubheader>
                            );
                        }

                        
                        const labelId = `checkbox-list-label-${item.id}`;

                        return (
                            <ListItem
                            key={item.id}
                            disablePadding
                            >
                            <ListItemButton dense onClick={()=>{selectprivilegeItem(item.id)}}>
                                <Checkbox
                                    edge="start"
                                    tabIndex={-1}
                                    disableRipple
                                    checked={privilegeList.indexOf(item.id) > -1}
                                    inputProps={{ 'aria-labelledby': labelId }}
                                />
                                <ListItemText id={labelId} primary={item.title} />
                            </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
                </div>
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
