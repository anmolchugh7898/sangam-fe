import {
  ArrowCircleLeft,
  ArrowLeft,
  ArrowLeftOutlined,
  ArrowRightAlt,
} from "@mui/icons-material";
import { Box, Grid2, IconButton, Typography } from "@mui/material";

export default function PreviewCustomer({ previewMode, customerData }) {
  return (
    <>
      <Box>
        <IconButton onClick={() => previewMode({ state: false, id: "" })}>
          <ArrowLeftOutlined />
        </IconButton>
        <Grid2
          sx={{
            backgroundColor: "white",
            boxShadow: "0px 1px 2px 0px cyan",
            borderRadius: "1rem",
            maxWidth: "60%",
            margin: "auto",
            padding: "1rem",
          }}
        >
          {/* <Grid2 alignSelf="center"> */}
          <Typography
            variant="h2"
            align="center"
            sx={{ marginBottom: "1.5rem" }}
          >
            Preview
          </Typography>
          <Grid2
            display="flex"
            flexDirection="column"
            gap="0.5rem"
            sx={{ margin: "1rem" }}
          >
            <Grid2 display="flex" flexDirection="column">
              <Typography variant="p" sx={{ fontWeight: "bold" }}>
                Name:
              </Typography>
              <Typography variant="p">{customerData.name}</Typography>
            </Grid2>
            <Grid2 display="flex" flexDirection="column">
              <Typography variant="p" sx={{ fontWeight: "bold" }}>
                Email:
              </Typography>
              <Typography variant="p">{customerData.email}</Typography>
            </Grid2>
            <Grid2 display="flex" flexDirection="column">
              <Typography variant="p" sx={{ fontWeight: "bold" }}>
                Phone:
              </Typography>
              <Typography variant="p">{customerData.phoneNumber}</Typography>
            </Grid2>
            <Grid2 display="flex" flexDirection="column">
              <Typography variant="p" sx={{ fontWeight: "bold" }}>
                Address:
              </Typography>
              <Typography variant="p">{customerData.address}</Typography>
            </Grid2>
            <Grid2 display="flex" flexDirection="column">
              <Typography variant="p" sx={{ fontWeight: "bold" }}>
                Date:
              </Typography>
              <Typography variant="p">{customerData.date}</Typography>
            </Grid2>
            <Grid2 display="flex" flexDirection="column">
              <Typography variant="p" sx={{ fontWeight: "bold" }}>
                Notes:
              </Typography>
              <Typography variant="p">{customerData.notes}</Typography>
            </Grid2>
          </Grid2>
          {/* </Grid2> */}
        </Grid2>
      </Box>
    </>
  );
}
