// src/views/dashboard/Dashboard.js
import Grid from '@mui/material/Grid';
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts';
import StatisticsCard from 'src/views/dashboard/StatisticsCard';
import UserChart from 'src/views/dashboard/UsersChart';
import BookingsChart from 'src/views/dashboard/BookingsChart';
import dynamic from 'next/dynamic'; // Import dynamic from next
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box } from '@mui/material';
import StatisticsCardSide from 'src/views/dashboard/StatisticsCardSide';

const Charts = dynamic(() => import('src/views/dashboard/Charts'), { ssr: false });

const Dashboard = () => {

  const [customerData, setCustomerData] = useState([0, 0]); // For membership data


   const [statistics, setStatistics] = useState({
      customers: 0,
      drivers: 0,
      activeDrivers: 0,
      todayBooktripCount:0,
      todayNewCustomers:0,
      todayNewDrivers:0,
      missedTripCount:0,
      deviceDetails:[]
    });


  const router = useRouter();

 
    let token;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('access_token');
    }
  
    useEffect(() => {
      const getStatistics = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/statistics`, {
            headers: {
              Authorization: `${token}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          });
          const data = await response.json();
          setStatistics({
            customers: data.data.customers || 0,
            drivers: data.data.drivers || 0,
            activeDrivers: data.data.activeDrivers || 0,
            todayBooktripCount:data.data.todayBooktripCount || 0,
            todayNewCustomers:data.data.todayNewCustomers || 0,
            todayNewDrivers:data.data.todayNewDrivers || 0,
            missedTripCount:data.data.missedTripCount || 0,
            deviceDetails:data.data.deviceDetails || []

          });
        } catch (error) {
          console.error('Error fetching statistics:', error);
        }
      };
  
      getStatistics();
    }, []);


  return (
 
      <Box
        sx={{
          backgroundColor: '#fff',
         
        }}
      >
        <Grid container spacing={6}>
          <Grid item xs={12} md={12}>
            <StatisticsCard data={statistics} />
          </Grid>
          <Grid item xs={12} md={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={9}>
                <Charts  data={statistics} />
              </Grid>
              <Grid item xs={12} md={3}>
                 <StatisticsCardSide data={statistics} />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6}>
            <UserChart />
          </Grid>
          <Grid item xs={12} md={6}>
            <BookingsChart />
          </Grid>
        </Grid>
      </Box>
  );
};

export default Dashboard;
