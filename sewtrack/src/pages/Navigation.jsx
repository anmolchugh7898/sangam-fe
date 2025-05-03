import React, { useState } from "react";
import {
  Drawer,
  List,
  CssBaseline,
  Box,
  ListItemButton,
  Avatar,
  Grid2,
  Typography,
  ImageListItem,
  IconButton,
  Tooltip,
  MenuItem,
  Menu,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Dashboard, GroupAdd, ListAlt, Logout } from "@mui/icons-material";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useNavigation,
} from "react-router";
import { deepOrange, indigo } from "@mui/material/colors";
import { motion } from "motion/react";
import toast, { Toaster } from "react-hot-toast";

const drawerWidth = 240;

export default function Navigation() {
  const navigation = useNavigation();
  const nav = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("md")); // 600px - 900px

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePrompt = () => {
    setAnchorEl(null);
  };

  function logoutHandler() {
    localStorage.clear();
    navigate("/");
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {isLargeScreen && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          <ImageListItem sx={{ paddingBottom: "1.5rem", paddingTop: "0.2rem" }}>
            <img
              style={{ height: "4.5em", width: "4.8rem", margin: "auto" }}
              loading="lazy"
              src="/SewTrack.png"
              alt="hospital"
            />
          </ImageListItem>
          {/* <Typography
            variant="h6"
            fontWeight="bold"
            paddingLeft="20px"
            marginBottom="14px"
            marginTop="14px"
          >
            Main menu
          </Typography> */}
          <List
            sx={{
              paddingLeft: "1rem",
              marginRight: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.2rem",
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `custom-side-anchor ${isActive ? "active-navlink" : ""}`
                }
                style={{
                  textDecoration: "none",
                  color: "#231f20",
                  transition: "all 0.3s ease",
                }}
              >
                <ListItemButton
                  style={{ display: "flex", gap: "1rem", alignItems: "center" }}
                >
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Dashboard />
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    Dashboard
                  </Typography>
                </ListItemButton>
              </NavLink>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <NavLink
                to="/customers"
                className={({ isActive }) =>
                  `custom-side-anchor ${isActive ? "active-navlink" : ""}`
                }
                style={{
                  textDecoration: "none",
                  color: "#231f20",
                  transition: "all 0.3s ease",
                }}
              >
                <ListItemButton
                  style={{ display: "flex", gap: "1rem", alignItems: "center" }}
                >
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <GroupAdd />
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    Customers
                  </Typography>
                </ListItemButton>
              </NavLink>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <NavLink
                to="/appointments"
                className={({ isActive }) =>
                  `custom-side-anchor ${isActive ? "active-navlink" : ""}`
                }
                style={{
                  textDecoration: "none",
                  color: "#231f20",
                  transition: "all 0.3s ease",
                }}
              >
                <ListItemButton
                  style={{ display: "flex", gap: "1rem", alignItems: "center" }}
                >
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <ListAlt />
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    Appointments
                  </Typography>
                </ListItemButton>
              </NavLink>
            </motion.div>
          </List>
        </Drawer>
      )}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Grid2
          display="flex"
          justifyContent="space-between"
          sx={{
            backgroundColor: "white",
            color: "white",
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
            paddingTop: "0.5rem",
            paddingBottom: "0.5rem",
            borderBottom: '1px solid rgba(137, 67, 67, .225)'
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            color="#894343"
            sx={{ alignSelf: "center" }}
          >
            Sew Track
          </Typography>
          {!isLargeScreen && (
            <Grid2 display={"flex"} justifyContent={"center"} gap={"1rem"}>
              <Tooltip title="Dashboard">
                <ListItemButton>
                  <Link to="dashboard" style={{ textDecoration: "none" }}>
                    <Dashboard sx={{ color: "white" }} />
                  </Link>
                </ListItemButton>
              </Tooltip>
              <Tooltip title="Customers">
                <ListItemButton>
                  <Link to="customers" style={{ textDecoration: "none" }}>
                    <GroupAdd sx={{ color: "white" }} />
                  </Link>
                </ListItemButton>
              </Tooltip>
              <Tooltip title="Appointments">
                <ListItemButton>
                  <Link to="appointments" style={{ textDecoration: "none" }}>
                    <ListAlt sx={{ color: "white" }} />
                  </Link>
                </ListItemButton>
              </Tooltip>
              <Tooltip title="Logout">
                <ListItemButton onClick={() => logoutHandler()}>
                  <Grid2>
                    <Logout sx={{ color: "white" }} />
                  </Grid2>
                </ListItemButton>
              </Tooltip>
            </Grid2>
          )}

          <Tooltip title="Menu">
            <IconButton onClick={handleClick}>
              <Avatar
                sx={{ bgcolor: "#894343", color: "#fff" }}
                alt="Remy Sharp"
                src={"any"}
              >
                B
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClosePrompt}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <Toaster />
            <MenuItem onClick={logoutHandler}>
              <Logout fontSize="12px" /> Logout
            </MenuItem>
          </Menu>
        </Grid2>
        <Box sx={{ p: 3, marginTop: "0.5rem", overflow: "hidden" }}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: -100 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                delay: 0.4,
                duration: 0.4,
                ease: "easeInOut",
              },
            }}
          >
            {navigation.state === "loading" ? (
              <Grid2 display="flex" justifyContent="center">
                <CircularProgress />
              </Grid2>
            ) : (
              <Outlet />
            )}
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}
