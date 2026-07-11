import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { Button, Collapse, Box } from '@mui/material'
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar'
import MuiAlert from '@mui/material/Alert'
import TableBasic from 'src/views/tables/TutorialTable'; 
import { useState, useEffect, useRef } from 'react'
import getFingerprint from 'src/utils/Fingerprint';
import axios from 'axios';

const TutorialsList = () => {
  const [data, setData] = useState([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: '', videoUrl: '', thumbnail: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  let token;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token')
  }

  const handleCloseSnackbar = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  const getTutorialList = async (page_num, perPageNum = 10, search = '') => {
    const queryParams = new URLSearchParams({
      page: page_num,
      perPage: perPageNum,
      search: search
    }).toString();

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/get-tutorial-list?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setData(data.data);
        setTotalRecords(data.totalRecords);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
        setPerPage(data.perPage);
      })
      .catch((err) => console.log(err))
  }

  useEffect(() => {
    getTutorialList(0);
  }, []);

  // Edit Click Handler (Table se data lekar form mein bharta hai)
  const handleEditClick = (item) => {
    setEditId(item.id);
    setIsEditing(true);
    setFormData({
      title: item.title,
      videoUrl: item.video_url,
      thumbnail: null // File input reset rakhte hain jab tak user naya select na kare
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({ title: '', videoUrl: '', thumbnail: null });
    setIsEditing(false);
    setEditId(null);
    setShowAddForm(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Form Submit Logic (Add & Update)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const uploadData = new FormData();
    uploadData.append('title', formData.title);
    uploadData.append('video_url', formData.videoUrl);
    if (formData.thumbnail) {
      uploadData.append('thumbnail', formData.thumbnail);
    }

    // Decide URL based on Add or Edit
    const apiUrl = isEditing 
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/update-tutorial/${editId}` 
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/save-tutorial`;

    try {
      
      const device_id = await getFingerprint()
      
      const response = await axios.post(apiUrl,uploadData, {
        headers: { 'Authorization': `${token}`,'x-device-id': device_id, },
      });
      
      // const res = await response.json();
      if (response?.data?.success) {
        setSuccessMessage(isEditing ? 'Tutorial updated successfully!' : 'Tutorial added successfully!');
        resetForm();
        getTutorialList(currentPage); 
      } else {
        setErrorMessage(response?.data?.message);
      }
    } catch (err) {
      setErrorMessage('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (idToDelete) => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/delete-tutorial/${idToDelete}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`
      }
    })
      .then(response => response.json())
      .then(resp => {
        if (resp.success) {
          setSuccessMessage('Tutorial deleted successfully!')
          setData(data.filter((item) => item.id != idToDelete));
        } else {
          setErrorMessage(resp.message)
        }
      })
      .catch(error => console.error('Error:', error))
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant='h5'>Tutorial Videos</Typography>
        <Button 
          variant="contained" 
          color={showAddForm ? "secondary" : "primary"}
          onClick={() => showAddForm ? resetForm() : setShowAddForm(true)}
        >
          {showAddForm ? 'Cancel' : 'Add New Video'}
        </Button>
      </Grid>

      <Grid item xs={12}>
        <Collapse in={showAddForm}>
          <Card sx={{ p: 5, mb: 4, backgroundColor: '#fdfdfd', border: '1px solid #eee' }}>
            <Typography variant="h6" sx={{ mb: 4 }}>
              {isEditing ? 'Edit Tutorial' : 'Add New Tutorial'}
            </Typography>
            <form onSubmit={handleFormSubmit}>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Video Title"
                    size="small"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="YouTube URL"
                    size="small"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
                    Thumbnail {isEditing && '(Optional if not changing)'}
                  </Typography>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files[0] })}
                    required={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color={isEditing ? "success" : "primary"} disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : (isEditing ? 'Update Tutorial' : 'Save Tutorial')}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Card>
        </Collapse>
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search Tutorials"
            onChange={(e) => getTutorialList(0, 10, e.target.value)}
            sx={{ width: '300px' }}
          />
        </Box>
        <Card>
          <TableBasic
            items={data}
            onDelete={handleDelete}
            onEdit={handleEditClick}
            totalRecords={totalRecords}
            totalPages={totalPages}
            currentPage={currentPage}
            perPage={perPage}
            onPageChange={getTutorialList}
          />
        </Card>
      </Grid>

      <Snackbar open={!!errorMessage} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="error">{errorMessage}</MuiAlert>
      </Snackbar>
      <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity="success">{successMessage}</MuiAlert>
      </Snackbar>
    </Grid>
  )
}

export default TutorialsList