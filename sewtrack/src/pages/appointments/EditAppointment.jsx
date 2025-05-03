import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid2,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { debounce } from "lodash";
import {
  fetchAllCustomers,
  fetchAppointmentItems,
  queryClient,
  updateAppointment,
} from "../../utils/API/http";
import { ArrowLeftOutlined } from "@mui/icons-material";
import {
  Formik,
  Form,
  Field,
  ErrorMessage,
  FieldArray,
  useFormikContext,
} from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  name: Yup.string().required("Customer selection is required"),
  noOfItemTypes: Yup.number()
    .required("Number of item types is required")
    .min(0, "Value cannot be less than 0")
    .max(10, "Value cannot be more than 10")
    .integer("Must be an integer"),
  items: Yup.array()
    .of(
      Yup.object({
        itemName: Yup.string().required("Item name is required"),
        itemQty: Yup.number()
          .required("Quantity is required")
          .positive("Quantity must be positive")
          .integer("Quantity must be an integer"),
        itemPrice: Yup.number()
          .required("Price is required")
          .positive("Price must be positive"),
      })
    )
    .test(
      "items-match-count",
      "The number of items must match the specified count",
      function (items) {
        const { noOfItemTypes } = this.parent;
        return noOfItemTypes > 0
          ? items && items.length === noOfItemTypes
          : true;
      }
    ),
  notes: Yup.string(),
  deliveryDate: Yup.date().nullable(),
});

const ItemArraySync = () => {
  const { values, setFieldValue } = useFormikContext();
  const { noOfItemTypes, items } = values;

  useEffect(() => {
    const currentItemCount = items.length;
    const targetItemCount = parseInt(noOfItemTypes, 10) || 0;

    if (isNaN(targetItemCount) || targetItemCount < 0 || targetItemCount > 10) {
      return;
    }

    if (currentItemCount < targetItemCount) {
      const newItems = Array(targetItemCount - currentItemCount).fill({
        itemName: "",
        itemQty: "",
        itemPrice: "",
      });
      setFieldValue("items", [...items, ...newItems], false);
    } else if (currentItemCount > targetItemCount) {
      setFieldValue("items", items.slice(0, targetItemCount), false);
    }
  }, [noOfItemTypes, items.length, setFieldValue]);

  return null;
};

export default function EditAppointmentFormik() {
  const { appointmentId, customerId } = useParams();
  const navigate = useNavigate();
  const redirect = debounce(() => navigate("/appointments"), 2000);

  const {
    data: appointmentItemsData,
    isLoading: isLoadingItems,
    isError: isErrorItems,
    error: errorItems,
  } = useQuery({
    queryKey: ["fetch-all-appointmentItems", appointmentId],
    queryFn: ({ signal }) => fetchAppointmentItems({ signal, appointmentId }),
    staleTime: 1000 * 5,
  });

  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["fetch-all-customers"],
    queryFn: fetchAllCustomers,
    staleTime: 1000 * 60 * 5,
  });

  const initialValues = useMemo(() => {
    if (!appointmentItemsData) {
      return {
        name: customerId || "",
        noOfItemTypes: 0,
        items: [],
        notes: "",
        deliveryDate: "",
      };
    }
    const formattedItems = appointmentItemsData.map((dataItem) => ({
      itemName: dataItem.item?.name || "",
      itemQty: dataItem.item?.qty || "",
      itemPrice: dataItem.item?.price || "",
    }));

    return {
      name: customerId || "",
      noOfItemTypes: formattedItems.length,
      items: formattedItems,
      notes: appointmentItemsData.notes || "",
      deliveryDate: appointmentItemsData.deliveryDate || "",
    };
  }, [appointmentItemsData, customerId]);

  const {
    mutate,
    isPending: isSubmittingMutation,
    error: mutationError,
  } = useMutation({
    mutationFn: updateAppointment,
    onSuccess: (data) => {
      console.log("Update Success:", data);
      queryClient.invalidateQueries({
        queryKey: ["fetch-all-appointments"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["fetch-all-appointmentItems"],
        exact: false,
      });
      toast.loading("Successfully updated appointment", { duration: 1900 });
      redirect();
    },
    onError: (error) => {
      console.error("Update Error:", error);
      if (error.status === 401) {
        localStorage.clear();
        toast.loading(error.message || "Token expired, logging you out!", {
          duration: 1900,
        });
        logout();
      } else {
        toast.error(error.message || "Failed to update appointment");
      }
    },
  });
  const logout = debounce(() => navigate("/"), 2000);
  if (isLoadingItems) {
    return (
      <Box sx={{ padding: 2 }}>
        <Skeleton variant="text" width="40%" sx={{ mb: 2 }} />
        <Skeleton
          variant="rectangular"
          width="100%"
          height={460}
          sx={{ borderRadius: "10px" }}
        />
      </Box>
    );
  }

  if (isErrorItems) {
    if (errorItems?.status === 406 || errorItems?.info?.status === 406) {
      toast.error("Could not load appointment data (406). Redirecting...");
      setTimeout(() => navigate("/appointments"), 2000);
      return null;
    }
    return (
      <Alert severity="error">
        Error loading appointment details:{" "}
        {errorItems?.message || "Unknown error"}
      </Alert>
    );
  }

  return (
    <>
      <Link to="/appointments" style={{ textDecoration: "none" }}>
        <IconButton>
          <ArrowLeftOutlined />
        </IconButton>
      </Link>
      <Box
        sx={{
          backgroundColor: "white",
          maxWidth: "60%",
          margin: "auto",
          boxShadow: "0px 1px 2px 0px cyan",
          borderRadius: "1rem",
          padding: "1rem 0",
        }}
      >
        <Toaster />
        <Grid2 sx={{ paddingBottom: "1rem" }}>
          <Typography variant="h5" sx={{ fontSize: "1.5rem" }} align="center">
            Edit Appointment
          </Typography>
        </Grid2>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize={true}
          onSubmit={(values, { setSubmitting }) => {
            console.log("Form Values on Update:", values);
            mutate({ appointmentId, values });
          }}
        >
          {({ errors, touched, values, isSubmitting }) => (
            <Form>
              <ItemArraySync />
              <Grid2
                container
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                  padding: "0 5rem 1.5rem 5rem",
                }}
              >
                <FormControl error={touched.name && Boolean(errors.name)}>
                  <InputLabel id="nameLabel">Select Customer</InputLabel>
                  <Field
                    as={Select}
                    labelId="nameLabel"
                    name="name"
                    label="Select Customer"
                    disabled={isLoadingCustomers}
                  >
                    {isLoadingCustomers ? (
                      <MenuItem value={values.name || ""} disabled>
                        <CircularProgress size={20} />
                      </MenuItem>
                    ) : customers && customers.length > 0 ? (
                      customers.map((customer) => (
                        <MenuItem value={customer.id} key={customer.id}>
                          {customer.customerId}{" "}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value={values.name || ""} disabled>
                        No customers found
                      </MenuItem>
                    )}
                    {!isLoadingCustomers &&
                      !customers?.find((c) => c.id === values.name) &&
                      values.name && (
                        <MenuItem value={values.name} key={values.name}>
                          Customer ID: {values.name}
                        </MenuItem>
                      )}
                  </Field>
                  <ErrorMessage name="name" component={FormHelperText} />
                </FormControl>

                <FieldArray name="items">
                  {() => (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      {values.items.map((item, index) => (
                        <Box
                          key={index}
                          sx={{
                            border: "1px dashed grey",
                            padding: "1rem",
                            borderRadius: "4px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                          }}
                        >
                          <Typography variant="subtitle2">
                            Item {index + 1}
                          </Typography>
                          {/* Use corrected name prop */}
                          <Field
                            as={TextField}
                            name={`items[${index}].itemName`}
                            label={`Item ${index + 1} Name`}
                            error={
                              touched.items?.[index]?.itemName &&
                              Boolean(errors.items?.[index]?.itemName)
                            }
                            helperText={
                              touched.items?.[index]?.itemName &&
                              errors.items?.[index]?.itemName
                            }
                            fullWidth
                            size="medium"
                          />
                          <Grid2 container spacing={2}>
                            <Grid2 xs={6} display="flex" gap="0.5rem">
                              <Field
                                as={TextField}
                                name={`items[${index}].itemQty`}
                                type="number"
                                label={`Item ${index + 1} Qty`}
                                error={
                                  touched.items?.[index]?.itemQty &&
                                  Boolean(errors.items?.[index]?.itemQty)
                                }
                                helperText={
                                  touched.items?.[index]?.itemQty &&
                                  errors.items?.[index]?.itemQty
                                }
                                InputProps={{ inputProps: { min: 1 } }}
                                fullWidth
                                size="medium"
                              />
                              <Field
                                as={TextField}
                                name={`items[${index}].itemPrice`}
                                type="number"
                                label={`Item ${index + 1} Price`}
                                error={
                                  touched.items?.[index]?.itemPrice &&
                                  Boolean(errors.items?.[index]?.itemPrice)
                                }
                                helperText={
                                  touched.items?.[index]?.itemPrice &&
                                  errors.items?.[index]?.itemPrice
                                }
                                InputProps={{ inputProps: { min: 0 } }}
                                fullWidth
                                size="medium"
                              />
                            </Grid2>
                          </Grid2>
                        </Box>
                      ))}
                      {typeof errors.items === "string" && (
                        <FormHelperText error>{errors.items}</FormHelperText>
                      )}
                    </Box>
                  )}
                </FieldArray>

                <Field
                  as={TextField}
                  name="notes"
                  label="Notes"
                  multiline
                  rows={3}
                  error={touched.notes && Boolean(errors.notes)}
                  helperText={touched.notes && errors.notes}
                  size="medium"
                />

                <Field
                  as={TextField}
                  name="deliveryDate"
                  label="Delivery Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  error={touched.deliveryDate && Boolean(errors.deliveryDate)}
                  helperText={touched.deliveryDate && errors.deliveryDate}
                  size="medium"
                />

                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    backgroundColor: "orange",
                    "&:hover": { backgroundColor: "darkorange" },
                  }}
                  disabled={isSubmittingMutation || isSubmitting}
                >
                  {isSubmittingMutation || isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Update Appointment"
                  )}
                </Button>

                {mutationError && !mutationError?.status && (
                  <Alert severity="error">
                    {mutationError.message ||
                      "An unexpected error occurred during update."}
                  </Alert>
                )}
              </Grid2>
            </Form>
          )}
        </Formik>
      </Box>
    </>
  );
}
