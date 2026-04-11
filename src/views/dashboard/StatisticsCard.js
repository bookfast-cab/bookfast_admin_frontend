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

const StatisticsCard = ({data}) => {
  const theme = useTheme();

  const [statistics, setStatistics] = useState({
    customers: 0,
    drivers: 0,
    activeDrivers: 0,
  });


  useEffect(() => {
   
    setStatistics({
      customers: data.customers || 0,
      drivers: data.drivers || 0,
      activeDrivers: data.activeDrivers || 0,
      todayBooktripCount:data.todayBooktripCount || 0,
    });

  }, [data]);

  const statisticsData = [
    {
      stats: statistics.customers,
      title: 'Customers',
      color: theme.palette.primary.main,
      bgColor: '#D6E4FF', // soft blue
      icon: <AccountOutline sx={{ fontSize: 28 }} />,
      link: '/customers/',
    },
    {
      stats: statistics.drivers,
      title: 'Drivers',
      color: theme.palette.success.main,
      bgColor: '#DEF8E7', // light mint green
      icon: <AccountGroup sx={{ fontSize: 28 }} />,
      link: '/drivers/',
    },
    {
      stats: statistics.activeDrivers,
      title: 'Today Active Drivers',
      color: theme.palette.warning.main,
      bgColor: '#dbff80', // pastel yellow
      icon: <CalendarClock sx={{ fontSize: 28 }} />,
      link: '/drivers?type=active',
    },
    {
      stats: statistics.todayBooktripCount || 0,
      title: 'Today Trips',
      color: theme.palette.secondary.main,
      bgColor: '#8dbbf7', // soft pink-purple
      icon: <CalendarClock sx={{ fontSize: 28 }} />,
      link: '/trips/today',
    },
  ];
  
  const renderStats = () =>
    statisticsData.map((item, index) => (
      <Grid item xs={12} sm={6} md={3} key={index}>
        <Link href={item.link} passHref legacyBehavior>
          <Box
            component="a"
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 3,
              minHeight: 120, // Increased height
              borderRadius: 1,
              backgroundColor: item.bgColor,
              transition: 'all 0.3s ease',
              textDecoration: 'none',
              color: 'inherit',
              boxShadow: 1,
              '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)',
              },
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

export default StatisticsCard;
