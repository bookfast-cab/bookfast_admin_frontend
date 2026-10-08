"use client";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { useState, useEffect, useMemo } from "react";
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
  Button,
  Autocomplete,
  TextField
} from "@mui/material";
import { getAllMenuItems } from 'src/navigation/vertical/menuItems';

const StaffTable = () => {
  const [data, setData] = useState([]);
  const [privilegeList, setprivilegeList] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [token, setToken] = useState(null);
  const [staffId, setStaffId] = useState(null);
  const [searchText, setSearchText] = useState("");

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

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/staff?perPage=100`, {
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

  const rawItems = getAllMenuItems();
  const allMenuItems = [];
  
  allMenuItems.push({ type: 'header', title: 'Dashboard' });

  rawItems.forEach(item => {
    if (item.sectionTitle) {
      allMenuItems.push({ type: 'header', title: item.sectionTitle });
    }
    if (item.title && item.privilege && item.privilege.length > 0 && !item.sectionTitle) {
      allMenuItems.push({ id: item.privilege[0], type: 'item', title: item.title });
    }
  });

  const staffOptions = useMemo(() => data?.filter((v) => v.userRole !== 'admin') || [], [data]);

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
                        value={staffId || ""}
                        inputProps={{ 'aria-label': 'Without label' }}
                        onClose={() => setSearchText("")}
                        MenuProps={{ autoFocus: false }}
                        onChange={(event,child)=>{
                                setStaffId(event?.target?.value);
                                if (event?.target?.value && child?.props?.privilege) {
                                    try {
                                        if (typeof child.props.privilege === 'string') {
                                            setprivilegeList(JSON.parse(child.props.privilege));
                                        } else if (Array.isArray(child.props.privilege)) {
                                            setprivilegeList(child.props.privilege);
                                        } else {
                                            setprivilegeList([]);
                                        }
                                    } catch (e) {
                                        console.error("Error parsing privilege", e);
                                        setprivilegeList([]);
                                    }
                                } else {
                                    setprivilegeList([]);
                                }
                            }
                        }
                        >
                        <ListSubheader>
                            <TextField
                                size="small"
                                autoFocus
                                placeholder="Search Staff..."
                                fullWidth
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key !== 'Escape') {
                                        e.stopPropagation();
                                    }
                                }}
                            />
                        </ListSubheader>
                        <MenuItem value="">
                            <em style={{ color: '#aaa' }}>Select Staff</em>
                        </MenuItem>
                        {staffOptions?.filter(v => v.name?.toLowerCase().includes(searchText.toLowerCase()) || v.email?.toLowerCase().includes(searchText.toLowerCase()))?.map((v,i)=>(
                            <MenuItem privilege={v.privilege} key={v.id} value={v.id}>{v.name} - {v.email}</MenuItem>
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
