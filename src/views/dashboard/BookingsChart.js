import React, { useEffect, useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Typography, CircularProgress } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

const BarsDataset = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getStatistics = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Authorization token not found');
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/statistics`, {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success) {
          // Map API response keys to match the chart's expected keys
          const formattedData = result.data.driverRegistrations.map((item) => ({
            date: item.date,
            drivers: item.count,
          }));
          setData(formattedData);
        } else {
          throw new Error(result.message || 'Failed to fetch statistics');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getStatistics();
  }, []);

  const chartSetting = {
    yAxis: [
      {
        label: 'Count',
      },
    ],
    height: 300,
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return (
      <Typography color="error">
        {`Error: ${error}`}
      </Typography>
    );
  }

  return (
    <div>
      <Card sx={{ marginBottom: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Drivers Registered in the Last 7 Days
          </Typography>
          <Box sx={{ width: '100%' }}>
            <BarChart
              dataset={data}
              xAxis={[{ scaleType: 'band', dataKey: 'date' }]} // Use 'date' as per API response
              series={[
                { dataKey: 'drivers', label: 'Drivers Registered' }, // Use 'drivers' as mapped
              ]}
              {...chartSetting}
            />
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default BarsDataset;
