import React from "react";
import { Grid, Paper, Typography } from "@mui/material";
import PageForm from "../../components/PageForm";

import { useRouter } from "next/router";

const WebsiteForm = () => {
  const router = useRouter();
  const isLanding = router.query.page_type === "landing";

  return (
    <Grid 
      container 
      justifyContent="center" 
      style={{ marginTop: "20px" }}
    >
      <Grid item xs={12} sm={12} md={12} lg={12}>
        <Paper elevation={3} style={{ padding: "20px", borderRadius: "10px" }}>
          <Typography variant="h5" align="center" gutterBottom>
            {isLanding ? "Add Landing Page" : "Add One Way Trip"}
          </Typography>
          <PageForm hidefeatureImage={true} />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default WebsiteForm;
