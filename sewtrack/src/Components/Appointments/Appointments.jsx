import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  FormControl,
  Grid2,
  InputAdornment,
  InputLabel,
  LinearProgress,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Skeleton,
  TableHead,
  TextField,
  Typography,
} from "@mui/material";
import * as React from "react";
import PropTypes from "prop-types";
import { duration, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import { Link, useNavigate } from "react-router";
import { indigo } from "@mui/material/colors";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Delete, Edit, Info, Preview, Search } from "@mui/icons-material";
import { useDebounce } from "use-debounce";
import { motion } from "motion/react";
import PreviewAppointment from "./PreviewAppointment";
import EditAppointment from "./EditAppointment";
import fetchAppointments, { queryClient } from "../../util/API/http";
import toast, { Toaster } from "react-hot-toast";
import { debounce } from "lodash";
const Conn = import.meta.env.VITE_CONN_URI;

export default function Appointments() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [keyword, setKeyword] = useState("");
  const [searchTerm] = useDebounce(keyword, 600);
  const [totalCount, setTotalCount] = React.useState(0);
  const [previewMode, setPreviewMode] = useState({ state: false, id: "" });
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["fetch-all-appointments", page, rowsPerPage, searchTerm],
    queryFn: ({ signal }) =>
      fetchAppointments({ signal, page, rowsPerPage, searchTerm }),
    staleTime: 60 * 1000 * 60,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (data) {
      setTotalCount(data.totalRecords);
    }
  }, [data]);

  function TablePaginationActions(props) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (event) => {
      onPageChange(event, 0);
    };

    const handleBackButtonClick = (event) => {
      onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event) => {
      onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event) => {
      onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
      <Box sx={{ flexShrink: 0, ml: 2.5 }}>
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
        >
          {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
        </IconButton>
        <IconButton
          onClick={handleBackButtonClick}
          disabled={page === 0}
          aria-label="previous page"
        >
          {theme.direction === "rtl" ? (
            <KeyboardArrowRight />
          ) : (
            <KeyboardArrowLeft />
          )}
        </IconButton>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="next page"
        >
          {theme.direction === "rtl" ? (
            <KeyboardArrowLeft />
          ) : (
            <KeyboardArrowRight />
          )}
        </IconButton>
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="last page"
        >
          {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
        </IconButton>
      </Box>
    );
  }

  TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
  };

  function splitDateTime(isoString) {
    const dateObj = new Date(isoString);

    const date = dateObj.toISOString().split("T")[0];

    let hours = dateObj.getUTCHours();
    const minutes = String(dateObj.getUTCMinutes()).padStart(2, "0");
    const amPm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    const time = `${hours}:${minutes} ${amPm}`;

    return { date, time };
  }

  function createData(
    id,
    suitsQty,
    custId,
    userName,
    phoneNumber,
    address,
    totalPrice,
    deliveryDate,
    isDelivered,
    notes
  ) {
    const { date } = splitDateTime(deliveryDate);
    return {
      id,
      suitsQty,
      custId,
      userName,
      phoneNumber,
      totalPrice,
      address,
      date,
      isDelivered,
      notes,
    };
  }

  const rows = data?.appointments?.map((eachAppointment) =>
    createData(
      eachAppointment.id,
      eachAppointment.suitsQty,
      eachAppointment.customer.id,
      eachAppointment.customer.name,
      eachAppointment.customer.phoneNumber,
      eachAppointment.customer.address,
      eachAppointment.totalPrice,
      eachAppointment.deliveryDate,
      eachAppointment.isDelivered,
      eachAppointment.notes
    )
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const redirect = debounce(() => {
    navigate("/");
  }, 2000);
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

  if (previewMode.state) {
    const customerData = rows.filter(
      (eachRow) => eachRow.id === previewMode.id
    );
    return (
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
      >
        <PreviewAppointment
          previewMode={setPreviewMode}
          customerData={customerData[0]}
        />
      </motion.div>
    );
  }
  if (isError) {
    if (error.info.status === 401) {
      localStorage.clear();
      toast.loading("Token expired, logging you out!", { duration: 1900 });
      redirect();
    }
  }
  return (
    <>
      <Toaster />
      <Typography
        variant="h4"
        fontWeight="bold"
        align="center"
        sx={{ marginBottom: "1rem" }}
      >
        Appointments
      </Typography>
      <Grid2
        display="flex"
        justifyContent="space-between"
        gap="1rem"
        alignItems="center"
      >
        <TextField
          type="search"
          size="small"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search"
          sx={{ width: "30rem" }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment>
                  {keyword.length === 0 && <Search />}
                </InputAdornment>
              ),
            },
          }}
        />
        <Link
          to="add-appointments"
          style={{ textDecoration: "none", color: "black" }}
        >
          <Button
            variant="contained"
            size="small"
            sx={{
              borderRadius: "6px",
              backgroundColor: indigo[300],
              marginBottom: "5px",
              paddingTop: "8px",
              paddingBottom: "8px",
              paddingLeft: "10px",
              paddingRight: "10px",
            }}
          >
            Add Appointment
          </Button>
        </Link>
      </Grid2>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
            <TableHead>
              <TableRow sx={{ marginBottom: "2rem" }}>
                <TableCell>
                  <Typography
                    variant="h6"
                    sx={{ fontSize: "1rem" }}
                    color="black"
                  >
                    Id
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography
                    variant="h6"
                    sx={{ fontSize: "1rem" }}
                    color="black"
                  >
                    Name
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="h6"
                    sx={{ fontSize: "1rem" }}
                    color="black"
                  >
                    Suits qty
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography
                    variant="h6"
                    sx={{ fontSize: "1rem" }}
                    color="black"
                  >
                    Delivered
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography
                    variant="h6"
                    sx={{ fontSize: "1rem" }}
                    color="black"
                  >
                    Delivery Date
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography
                    variant="h6"
                    sx={{ fontSize: "1rem" }}
                    color="black"
                  >
                    Total Price
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography
                    variant="h6"
                    sx={{ fontSize: "1rem" }}
                    color="black"
                  >
                    Action
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows?.length > 0 ? (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell component="th" style={{ width: 80 }} scope="row">
                      {row.id}
                    </TableCell>
                    <TableCell
                      component="th"
                      style={{ width: 150 }}
                      scope="row"
                      align="center"
                    >
                      {row.userName}
                    </TableCell>
                    <TableCell
                      component="th"
                      style={{ width: 100 }}
                      scope="row"
                      align="center"
                    >
                      {row.suitsQty}
                    </TableCell>
                    <TableCell
                      style={{ width: 150 }}
                      align="center"
                      sx={{ fontSize: "12.5px" }}
                    >
                      {row.isDelivered ? "Delivered" : "Pending"}
                    </TableCell>
                    <TableCell
                      style={{ width: 140 }}
                      align="center"
                      sx={{ fontSize: "12.5px" }}
                    >
                      {row.date}
                    </TableCell>
                    <TableCell
                      style={{ width: 100 }}
                      align="center"
                      sx={{ fontSize: "12.5px" }}
                    >
                      {row.totalPrice}
                    </TableCell>
                    <TableCell
                      style={{ width: 160 }}
                      align="center"
                      sx={{ fontSize: "13px" }}
                    >
                      <Link
                        to={`edit-appointments/${row.custId}/${row.id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <IconButton>
                          <Edit sx={{ color: indigo[300] }} />
                        </IconButton>
                      </Link>
                      <IconButton
                        onClick={() =>
                          setPreviewMode({ state: true, id: row.id })
                        }
                      >
                        <Info sx={{ color: indigo[300] }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={12} height={200} align="center">
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: "#2f2f2f",
                      }}
                    >
                      No appointment found
                    </span>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                  colSpan={12}
                  count={totalCount}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  slotProps={{
                    select: {
                      inputProps: {
                        "aria-label": "rows per page",
                      },
                    },
                  }}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
    </>
  );
}
