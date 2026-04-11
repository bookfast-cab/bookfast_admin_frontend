// ** MUI Imports
import {
  Box,
  Grid,
  Card,
  Avatar,
  CardHeader,
  IconButton,
  Typography,
  CardContent,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// ** Icons Imports
import AccountOutline from 'mdi-material-ui/AccountOutline';
import AccountGroup from 'mdi-material-ui/AccountGroup';
import CalendarClock from 'mdi-material-ui/CalendarClock';
import DotsVertical from 'mdi-material-ui/DotsVertical';
import ReportProblemRounded from '@mui/icons-material/ReportProblemRounded';


const StatisticsCardSide = ({data}) => {
  const theme = useTheme();

  const [statistics, setStatistics] = useState({
    todayNewCustomers: 0,
    todayNewDrivers: 0,
    activeDrivers: 0,
    missedTripCount:0
  });


  useEffect(() => {
   
    setStatistics({
      todayNewCustomers: data.todayNewCustomers || 0,
      todayNewDrivers: data.todayNewDrivers || 0,
      activeDrivers: data.activeDrivers || 0,
      todayBooktripCount:data.todayBooktripCount || 0,
      missedTripCount:data.missedTripCount||0
    });

  }, [data]);

  const statisticsData = [
    {
      stats: statistics.todayNewCustomers,
      title: 'Today New Customers',
      color: theme.palette.info.main, // softer blue
      bgColor: '#E3F2FD', // light info blue
      icon: <AccountOutline sx={{ fontSize: 28 }} />,
      link: '/customers/',
    },
    {
      stats: statistics.todayNewDrivers,
      title: 'Today New Drivers',
      color: theme.palette.success.dark, // darker green
      bgColor: '#E6F4EA', // very light mint
      icon: <AccountGroup sx={{ fontSize: 28 }} />,
      link: '/drivers/',
    },
    {
      stats: statistics.missedTripCount,
      title: 'Total Missed Trip',
      color: theme.palette.error.main, // red for alert
      bgColor: '#FFEBEE', // light red/pink background
      icon: <ReportProblemRounded sx={{ fontSize: 28 }} />, // warning/alert icon
      link: '/trips?type=9',
    },
  ];
  
  const renderStats = () =>
    statisticsData.map((item, index) => (
      <Grid item xs={12} key={index}>
        <Link href={item.link} passHref legacyBehavior>
          <Box
            component="a"
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 3,
              minHeight: 85,
              borderRadius: 1,
             
              transition: 'all 0.3s ease',
              textDecoration: 'none',
              color: 'inherit',
              boxShadow: 1,
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)',
              },
              marginLeft:2
            }}
          >
            <Avatar
              variant="rounded"
              sx={{
                mr: 3,
                width: 48,
                height: 48,
                background: item.color,
                color: 'white',
                boxShadow: 2,
              
              }}
            >
              {item.icon}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                {item.title}
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {item.stats}
              </Typography>
            </Box>
          </Box>
        </Link>
      </Grid>
    ));
  
  

  return (
   <>
      
      <Grid container spacing={3}>
          {renderStats()}
        </Grid>
      </>
  );
};

export default StatisticsCardSide;
