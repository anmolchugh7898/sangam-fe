import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login, { loginLoader } from "./pages/Login";
import { createTheme, Skeleton, ThemeProvider } from "@mui/material";
import { grey } from "@mui/material/colors";
import Navigation from "./pages/Navigation";
import RouteAuthGuardLoader from "./utils/loaders/RouteAuthGuardLoader";
import Dashboard from "./pages/Dashboard";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/API/http";
import './index.css'
import Appointments from './pages/Appointments/Appointments';
import AddCustomer from './pages/Customers/AddCustomer';
import AddAppointment from "./pages/appointments/AddAppointments";
import Customers from './pages/Customers/Customers';
export default function App() {
  const theme = createTheme({
    palette: {
      background: {
        default: grey[50],
      },
    },
    typography: {
      fontFamily: '"Be Vietnam Pro", sans-serif',
    },
  });

  const router = createBrowserRouter([
    {
      path: "/",
      loader: loginLoader,
      hydrateFallbackElement: (
        <Skeleton width={500} height={500} sx={{ margin: "auto" }} />
      ),
      element: <Login />,
    },
    {
      path: "/",
      loader: RouteAuthGuardLoader,
      element: <Navigation />,
      children: [
        {
          path: "/dashboard",
          element: <Dashboard />,
        },
        {
          path: "/customers",
          element: <Customers />,
        },
        {
          path: "/customers/add-customer",
          element: <AddCustomer />,
        },
        {
          path: "/appointments",
          element: <Appointments />,
        },
        {
          path: "/appointments/add-appointments",
          element: <AddAppointment />,
        },
        // {
        //   path: "/appointments/edit-appointments/:customerId/:appointmentId",
        //   element: <EditAppointment />,
        // },
      ],
    },
  ]);

  return (
    <>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ThemeProvider>
    </>
  );
}
