import React from "react";
import { Grid, Paper, Typography } from "@mui/material";
import PageForm from "../../components/tourPackageForm";
import { useRouter } from "next/router";

const EditUrbaniaTourPackage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Grid
      container
      justifyContent="center"
      style={{ marginTop: "20px" }}
    >
      <Grid item xs={12} sm={12} md={12} lg={12}>
        <Paper elevation={3} style={{ padding: "20px", borderRadius: "10px" }}>
          <Typography variant="h5" align="center" gutterBottom>
            Edit Urbania Tour Package
          </Typography>
          <PageForm id={id} package_type="urbania" />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default EditUrbaniaTourPackage;

