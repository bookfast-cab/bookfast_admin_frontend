"use client";
import { useState } from 'react';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { useRouter } from 'next/router';
import GoogleMapComponent from '../../../components/GoogleMap';


const CreateZone = () => {
  const router = useRouter();
  const {id}=router.query;
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const handleCreatePolygon = async (polygonData) => {
    if (!token) return;

    setLoading(true);

    try {
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/zones/${id}/polygon`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
          body: JSON.stringify({
            polygon: polygonData, // Send the polygon coordinates as a string
          }),
        }

      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data. Status: ${response.status}`);
      }

      const result = await response.json();
    } catch (error) {
      setErrorMessage('Failed to fetch app version data.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Grid container spacing={6} style={{marginBottom:"40px"}}>
          <Grid item xs={6}>
            <Typography variant="h6">{'Zones'}</Typography>
          </Grid>
          <Grid item xs={6} style={{ textAlign: 'right' }}>
            <Button variant="contained" onClick={() => router.push('/zones')}>
              Back
            </Button>
          </Grid>
        </Grid>


        <GoogleMapComponent googlePoly={handleCreatePolygon} />
      </CardContent>
    </Card>
  );
};

export default CreateZone;
