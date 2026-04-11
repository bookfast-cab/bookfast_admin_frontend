import React from "react";
import { Grid, Paper, Typography } from "@mui/material";
import PageForm from "../../components/editTourPackageForm";
import {useRouter} from "next/router";

const EditTourPackage = () => {
  const Router = useRouter();
  const { id } = Router.query;
  
  return (
    <Grid 
      container 
      justifyContent="center" 
      style={{ marginTop: "20px" }}
    >
      <Grid item xs={12} sm={12} md={12} lg={12}>
        <Paper elevation={3} style={{ padding: "20px", borderRadius: "10px" }}>
          <Typography variant="h5" align="center" gutterBottom>
            Edit Tour Package
          </Typography>
          <PageForm id={id} />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default EditTourPackage;
