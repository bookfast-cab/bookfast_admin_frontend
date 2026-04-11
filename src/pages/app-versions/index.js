"use client";
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import TableBasic from 'src/views/tables/AppVersionTable';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import PlusIcon
const PlusIcon = dynamic(() => import('@heroicons/react/24/solid/PlusIcon'), { ssr: false });

const MUITable = () => {
  const [data, setData] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(0);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Retrieve token from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('access_token'));
    }
  }, []);

  // Close Snackbar
  const handleCloseSnackbar = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Fetch App Versions
  const getAppVersion = async (page_num) => {
    if (!token) return;

    setIsLoading(true);

    try {
      const queryParams = new URLSearchParams({ page: page_num }).toString();
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/app-version-list?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data. Status: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data || []);
      setTotalRecords(result.totalRecords || 0);
      setTotalPages(result.totalPages || 0);
      setCurrentPage(result.currentPage || 1);
      setPerPage(result.perPage || 0);
    } catch (error) {
      setErrorMessage('Failed to fetch app version data.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on token or page change
  useEffect(() => {
    if (token) {
      getAppVersion(1);
    }
  }, [token]);

  // Prevent mismatches by showing a loading state
  if (isLoading || !token) {
    return (
      <Grid container spacing={6}>
        <Typography>Loading...</Typography>
      </Grid>
    );
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={6}>
        <Typography variant="h5">Force App Update</Typography>
      </Grid>
      <Grid item xs={12}>
        <Card>
          <TableBasic
            items={data}
            onUpdateStatus={(id, newStatus) =>
              setData((prevData) =>
                prevData.map((item) =>
                  item.id === id ? { ...item, status: newStatus } : item
                )
              )
            }
            totalRecords={totalRecords}
            totalPages={totalPages}
            currentPage={currentPage}
            perPage={perPage}
            onPageChange={getAppVersion}
          />
        </Card>
      </Grid>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="error">
          {errorMessage}
        </MuiAlert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="success">
          {successMessage}
        </MuiAlert>
      </Snackbar>
    </Grid>
  );
};

export default MUITable;
