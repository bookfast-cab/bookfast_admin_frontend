import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardContent, Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
 } from '@mui/material';

// Dynamically import Chart with SSR disabled
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const Charts = ({ data }) => {
  const userData = [data.customers || 0, data.drivers || 0];
  const driverData = [data.drivers || 0, data.activeDrivers || 0];

  // ✅ Use all device details: android & iOS for both user types
  const deviceStats = data.deviceDetails || [];

  const deviceLabels = deviceStats.map(
    (item) =>
      `${item.user_type.charAt(0).toUpperCase() + item.user_type.slice(1)} (${item.device_os})`
  );
  const deviceCounts = deviceStats.map((item) => item.count);

  const userOptions = {
    chart: {
      type: 'pie',
      height: '300',
    },
    labels: ['Customers', 'Drivers'],
    colors: ['#775DD0', '#00E396'],
  };

  const driverOptions = {
    chart: {
      type: 'pie',
      height: '300',
    },
    labels: ['Drivers', 'Active Drivers'],
    colors: ['#FF69B4', '#1E90FF'],
  };

  const deviceOptions = {
    chart: {
      type: 'pie',
      height: '300',
    },
    labels: deviceLabels,
    colors: ['#FFA500', '#00BFFF', '#FF4500', '#008080'], // Orange, Blue, Red-Orange, Teal
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Users" />
          <CardContent>
            <Chart options={userOptions} series={userData} type="pie" height={160} />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title="Bookings Status" />
          <CardContent>
            <Chart options={driverOptions} series={driverData} type="pie" height={160} />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={6}>
        <Card>
          <CardHeader title="Device Stats (Android & iOS)" />
          <CardContent>
            <Chart options={deviceOptions} series={deviceCounts} type="pie" height={160} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={6}>
        <Card>
          <CardHeader title="Device Counting (Android & iOS)" />
          <CardContent>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>User Type</strong></TableCell>
                    <TableCell><strong>Device OS</strong></TableCell>
                    <TableCell><strong>Count</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deviceStats.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.user_type}</TableCell>
                      <TableCell>{item.device_os}</TableCell>
                      <TableCell>{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Charts;
