import {
  Box,
  Button,
  CircularProgress,
  Grid2,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Form, useNavigate } from "react-router";
import toast, { Toaster } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { addNewCustomer, queryClient } from "../../utils/API/http.js";
import { debounce } from "lodash";
import {
  CheckBox,
  CheckBoxOutlineBlankRounded,
  Info,
} from "@mui/icons-material";
import { indigo } from "@mui/material/colors";
const Conn = import.meta.env.VITE_CONN_URI;

export default function AddCustomer() {
  const [submissionProgress, setSubmissionProgress] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerfying] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [error, setError] = useState({
    nameError: {
      state: false,
      message: "",
    },
    addressError: {
      state: false,
      message: "",
    },
    phoneError: {
      state: false,
      message: "",
    },
    notesError: {
      state: false,
      message: "",
    },
    customerIdError: {
      state: false,
      message: "",
    },
    emailError: {
      state: false,
      message: "",
    },
  });
  const redirect = debounce(() => navigate("/customers"), 2000);
  const logout = debounce(() => navigate("/"), 2000);

  const navigate = useNavigate();

  function onChangeHandler(event) {
    const id = event.target.id || event.target.name;
    const value = event.target.value;
    switch (id) {
      case "name":
        setName(value);
        setError((prevState) => ({
          ...prevState,
          nameError: {
            state: false,
            message: "",
          },
        }));
        break;
      case "address":
        setAddress(value);
        setError((prevState) => ({
          ...prevState,
          addressError: {
            state: false,
            message: "",
          },
        }));
        break;
      case "phoneNumber":
        setPhoneNumber(value);
        setError((prevState) => ({
          ...prevState,
          phoneError: {
            state: false,
            message: "",
          },
        }));
        break;
      case "email":
        setEmail(value);
        setError((prevState) => ({
          ...prevState,
          emailError: {
            state: false,
            message: "",
          },
        }));
        break;
      case "customerId":
        setIsVerified(false);
        setCustomerId(value);
        setError((prevState) => ({
          ...prevState,
          customerIdError: {
            state: false,
            message: "",
          },
        }));
        break;
      case "notes":
        setNotes(value);
        setError((prevState) => ({
          ...prevState,
          notesError: {
            state: false,
            message: "",
          },
        }));
        break;
      default:
        break;
    }
  }

  function containsNumber(name) {
    return /\d/.test(name);
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  function onBlurHandler(event) {
    const id = event.target.id || event.target.name;
    const value = event.target.value;
    switch (id) {
      case "name":
        if (containsNumber(value) || value.trim().length === 0) {
          setError((prevState) => ({
            ...prevState,
            nameError: {
              state: true,
              message: "Invalid Name",
            },
          }));
        }
        break;

      case "address":
        if (value.trim().length === 0) {
          setError((prevState) => ({
            ...prevState,
            addressError: {
              state: true,
              message: "Invalid address provided",
            },
          }));
        }
        break;

      case "email":
        if (!isValidEmail(value)) {
          setError((prevState) => ({
            ...prevState,
            emailError: {
              state: true,
              message: "Invalid email provided",
            },
          }));
        }
        break;

      case "customerId":
        if (value.length < 6) {
          setError((prevState) => ({
            ...prevState,
            customerIdError: {
              state: true,
              message: "Customer id must be atleast 6 character long",
            },
          }));
        }
        break;
      case "phoneNumber":
        if (isNaN(value)) {
          setError((prevState) => ({
            ...prevState,
            phoneError: {
              state: true,
              message: "Invalid value provided",
            },
          }));
        } else if (value.trim().length !== 10) {
          setError((prevState) => ({
            ...prevState,
            phoneError: {
              state: true,
              message: "Phone number must have 10 digits",
            },
          }));
        }
        break;
      default:
        break;
    }
  }

  const { mutate, error: mutateError } = useMutation({
    mutationFn: addNewCustomer,
    onSuccess: () => {
      setSubmissionProgress(false);
      queryClient.invalidateQueries({
        queryKey: ["fetch-all-customers"],
        exact: false,
      });
      toast.loading(
        "Successfully added Customer, redirecting to Customer's page",
        {
          duration: 1900,
        }
      );
      redirect();
    },
    onError: (error) => {
      setSubmissionProgress(false);
      console.log(error);
      if (error.info.status === 401) {
        toast.loading("Token expired, logging out", { duration: 1900 });
        localStorage.clear();
        logout();
      } else {
        if (error.info.status === 300) {
          toast.error("Customer already exsist!");
        } else {
          toast.error(error.info.statusText);
        }
      }
    },
  });

  async function verifyCustomerId() {
    setIsVerfying(true);
    const response = await fetch(
      `${Conn}/customers/verifyCustomerId/?customerId=${customerId}`,
      {
        headers: {
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (response.ok) {
      setIsVerified(true);
      toast.success("Username accepted!");
    } else {
      if (response.status === 401) {
        localStorage.clear();
        toast.loading("Token expired, logging out", { duration: 1900 });
        logout();
      } else {
        toast("Username already exist!", {
          icon: <Info sx={{ color: indigo[300] }} />,
        });
      }
    }
    setIsVerfying(false);
  }
  async function onSubmitHandler(event) {
    event.preventDefault();
    setSubmissionProgress(true);
    const formData = {
      name: name,
      email: email,
      address: address,
      phoneNumber: phoneNumber,
      customerId,
      notes,
    };
    mutate({ formData });
  }

  return (
    <>
      <Box
        sx={{
          backgroundColor: "white",
          maxWidth: "60%",
          margin: "auto",
          boxShadow: "0px 1px 2px 0px cyan",
          borderRadius: "1rem",
        }}
      >
        <Toaster />
        <Grid2 sx={{ paddingTop: "1rem" }}>
          <Typography variant="h5" sx={{ fontSize: "1.5rem" }} align="center">
            Add Customer
          </Typography>
          <Typography
            variant="caption"
            align="center"
            display="flex"
            justifyContent="center"
            color="red"
          >
            {submissionProgress && (
              <Grid2 display="flex" justifyContent="center">
                <CircularProgress />
              </Grid2>
            )}
          </Typography>
        </Grid2>
        <Form onSubmit={onSubmitHandler}>
          <Grid2
            container
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "0.8rem",
              paddingLeft: "5rem",
              paddingRight: "5rem",
              paddingBottom: "1.5rem",
              paddingTop: "1rem",
            }}
          >
            <TextField
              name="customerId"
              id="customerId"
              label="Choose a 6 character unique customer id"
              type="text"
              autoFocus
              value={customerId}
              onBlur={onBlurHandler}
              error={error.customerIdError.state}
              helperText={
                error.customerIdError.message ||
                (isVerified && "Customer id accepted")
              }
              onChange={onChangeHandler}
              slotProps={{
                input: {
                  endAdornment: (
                    <Tooltip title="Check availability">
                      <InputAdornment>
                        <IconButton
                          onClick={verifyCustomerId}
                          disabled={error.customerIdError.state}
                        >
                          {isVerifying ? (
                            <CircularProgress size={20} />
                          ) : !isVerified ? (
                            <CheckBoxOutlineBlankRounded />
                          ) : (
                            <CheckBox />
                          )}
                        </IconButton>
                      </InputAdornment>
                    </Tooltip>
                  ),
                },
              }}
              size="medium"
            />
            <TextField
              name="name"
              id="name"
              label="Enter name of the customer"
              value={name}
              onBlur={onBlurHandler}
              error={error.nameError.state}
              helperText={error.nameError.message}
              onChange={onChangeHandler}
              disabled={!isVerified}
              size="medium"
            />
            <TextField
              name="email"
              id="email"
              label="Enter email of the customer"
              value={email}
              onBlur={onBlurHandler}
              error={error.emailError.state}
              helperText={error.emailError.message}
              disabled={!isVerified}
              onChange={onChangeHandler}
              size="medium"
            />
            <TextField
              name="address"
              id="address"
              type="address"
              label="Enter address of the customer"
              value={address}
              onBlur={onBlurHandler}
              disabled={!isVerified}
              error={error.addressError.state}
              helperText={error.addressError.message}
              onChange={onChangeHandler}
              size="medium"
            />
            <TextField
              name="phoneNumber"
              id="phoneNumber"
              type="text"
              label="Enter customer's phone number"
              value={phoneNumber}
              onBlur={onBlurHandler}
              disabled={!isVerified}
              error={error.phoneError.state}
              helperText={error.phoneError.message}
              onChange={onChangeHandler}
              size="medium"
            />
            <TextField
              name="notes"
              id="notes"
              label="Enter notes such as measurements of the customer"
              type="text"
              value={notes}
              disabled={!isVerified}
              onBlur={onBlurHandler}
              error={error.notesError.state}
              helperText={error.notesError.message}
              onChange={onChangeHandler}
              size="medium"
            />

            <Button type="submit" variant="contained" disabled={!isVerified}>
              Submit
            </Button>
          </Grid2>
        </Form>
      </Box>
    </>
  );
}
