import React from "react";
import { Grid, Paper, Typography } from "@mui/material";
import PageForm from "../../components/tourPackageForm";
import { useRouter } from "next/router";

const TourPackage = () => {
  const router = useRouter();
  const packageType = router.query.package_type || "main";
  const isUrbania = packageType === "urbania";

  return (
    <Grid 
      container 
      justifyContent="center" 
      style={{ marginTop: "20px" }}
    >
      <Grid item xs={12} sm={12} md={12} lg={12}>
        <Paper elevation={3} style={{ padding: "20px", borderRadius: "10px" }}>
          <Typography variant="h5" align="center" gutterBottom>
            {isUrbania ? "Add Urbania Tour Package" : "Add Tour Package"}
          </Typography>
          <PageForm package_type={packageType} />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default TourPackage;
