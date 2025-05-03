import { ArrowBack, ArrowLeftOutlined } from "@mui/icons-material";
import { Box, Grid2, IconButton, Skeleton, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { fetchAppointmentItems } from "../../utils/API/http";

export default function PreviewAppointment({ previewMode, customerData }) {
  const { data, isLoading } = useQuery({
    queryKey: ["fetch-all-appointmentItems", customerData.id],
    queryFn: ({ signal }) =>
      fetchAppointmentItems({ signal, appointmentId: customerData.id }),
    staleTime: 60 * 1000 * 60,
  });

  if (isLoading) {
    return (
      <Skeleton
        variant="rectangular"
        width="100%"
        height={460}
        sx={{ borderRadius: "10px" }}
      />
    );
  }
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
              <Typography variant="p">{customerData.userName}</Typography>
            </Grid2>
            {/* <Grid2 display="flex" flexDirection="column">
              <Typography variant="p" sx={{ fontWeight: "bold" }}>
                Contact:
              </Typography>
              <Typography variant="p">{customerData.phoneNumber}</Typography>
            </Grid2> */}
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
                Date of delivery:
              </Typography>
              <Typography variant="p">{customerData.date}</Typography>
            </Grid2>
            <Grid2 display="flex" flexDirection="column">
              <Typography variant="p" sx={{ fontWeight: "bold" }}>
                Items:
              </Typography>
              <Typography variant="p">
                {data?.map(
                  (eachItem) =>
                    eachItem.item +
                    ` (Rs ${eachItem.price}) x ${eachItem.qty} = ${eachItem.totalPrice}, `
                )}
              </Typography>
            </Grid2>
            <Grid2 display="flex" flexDirection="column">
              <Typography variant="p" sx={{ fontWeight: "bold" }}>
                Total amount:
              </Typography>
              <Typography variant="p">{customerData.totalPrice}</Typography>
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
