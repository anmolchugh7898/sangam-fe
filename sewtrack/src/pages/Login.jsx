import {
  Box,
  Button,
  CircularProgress,
  CssBaseline,
  Grid2,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { debounce } from "lodash";
import { Form, useNavigate } from "react-router";
import { redirect } from "react-router-dom";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { indigo } from "@mui/material/colors";
import useAuth from "../utils/useAuth";
const Conn = import.meta.env.VITE_CONN_URI;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [visibility, setVisibility] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({
    phoneError: {
      state: false,
      message: "",
    },
    passwordError: {
      state: false,
      message: "",
    },
  });

  const navigate = useNavigate();

  const redirect = debounce(() => {
    navigate("/dashboard");
  }, 2000);

  function onBlurHandler(event) {
    const { id, value } = event.target;
    switch (id) {
      case "phone":
        if (value.trim().length !== 10 || isNaN(value)) {
          setError((prevState) => ({
            ...prevState,
            phoneError: {
              state: true,
              message: "Invalid phone number provided",
            },
          }));
        }
        break;
      case "password":
        if (password.trim().length < 8) {
          setError((prevState) => {
            return {
              ...prevState,
              passwordError: {
                state: true,
                message: "Password must be atleast 8 character long",
              },
            };
          });
        }
        break;
      default:
        break;
    }
  }
  async function login(event) {
    event.preventDefault();
    if (password.trim().length === 0) {
      setError((prevState) => ({
        ...prevState,
        passwordError: {
          state: true,
          message: "Password must be atleast 8 character long",
        },
      }));
      return;
    }
    setIsLoading(true);
    const formData = {
      phone,
      password,
    };
    try {
      const response = await fetch(`${Conn}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      setIsLoading(false);
      if (!response.ok) {
        toast.error("Invalid phone number or password");
        return;
      }
      const data = await response.json();
      localStorage.setItem("token", data.token);
      toast.loading("Login successful", { duration: 1900 });
      redirect();
    } catch (error) {
      setIsLoading(false);
      console.log("server eror: ", error);
      toast.error("Server is not responding, check your connection!");
    }
  }

  function onChangeHandler(event) {
    const key = event.target.id || event.target.name;
    const value = event.target.value;

    switch (key) {
      case "phone":
        setPhone(value);
        setError((prevState) => ({
          ...prevState,
          phoneError: {
            state: false,
            message: "",
          },
        }));
        break;
      case "password":
        setPassword(value);
        setError((prevState) => ({
          ...prevState,
          passwordError: {
            state: false,
            message: "",
          },
        }));
        break;
      default:
        break;
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -200 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ marginTop: "3rem" }}
    >
      <Toaster />
      <Grid2
        sx={{
          backgroundColor: "white",
          paddingBottom: "6rem",
          paddingTop: "5rem",
          paddingLeft: { sm: "6rem", xs: "2rem" },
          paddingRight: { sm: "6rem", xs: "2rem" },
          maxWidth: { sm: "50%", xs: "90%" },
          margin: "auto",
          borderRadius: "1.5rem",
          boxShadow: "0px 1px 2px 0px gray",
        }}
      >
        <CssBaseline />
        <Typography
          variant="h2"
          align="center"
          sx={{ marginBottom: "0.5rem", fontSize: { sm: "4rem", xs: "3rem" } }}
        >
          Login
        </Typography>

        <Form onSubmit={login}>
          <Grid2
            sx={{
              margin: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginTop: "2rem",
            }}
          >
            <TextField
              type="tel"
              size="medium"
              autoFocus
              value={phone}
              error={error.phoneError.state}
              helperText={error.phoneError.state && error.phoneError.message}
              id="phone"
              name="phone"
              onChange={onChangeHandler}
              label="Enter phone number"
              onBlur={onBlurHandler}
              fullWidth
            />
            <TextField
              type={!visibility ? "password" : "text"}
              size="medium"
              error={error.passwordError.state}
              helperText={
                error.passwordError.state && error.passwordError.message
              }
              value={password}
              id="password"
              onBlur={onBlurHandler}
              name="password"
              onChange={onChangeHandler}
              label="Enter password"
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setVisibility((prevState) => !prevState)}
                      >
                        {!visibility ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ marginTop: "1rem", backgroundColor: indigo[300] }}
              disabled={error.phoneError.state || error.passwordError.state}
            >
              {isLoading ? (
                <CircularProgress size={23} sx={{ color: "white" }} />
              ) : (
                "Submit"
              )}
            </Button>
          </Grid2>
        </Form>
      </Grid2>
    </motion.div>
  );
}

export async function loginLoader() {
  const verifiedAuth = await useAuth();
  if (verifiedAuth.response) {
    return redirect("/dashboard");
  }
  return null;
}
