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
  TextField,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { debounce } from "lodash";
import {
  fetchAllCustomers,
  queryClient,
  createAppointment,
} from "../../utils/API/http";
import { ArrowBack, ArrowLeftOutlined } from "@mui/icons-material";
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
      setFieldValue("items", [...items, ...newItems]);
    } else if (currentItemCount > targetItemCount) {
      setFieldValue("items", items.slice(0, targetItemCount));
    }
  }, [noOfItemTypes, items, setFieldValue]);

  return null;
};

export default function AddAppointment() {
  const navigate = useNavigate();
  const redirect = debounce(() => navigate("/appointments"), 2000);
  const logout = debounce(() => navigate("/"), 2000);
  const {
    data: customers,
    isLoading: isLoadingCustomers,
    isError: isErrorCustomers,
  } = useQuery({
    queryKey: ["fetch-all-customers"],
    queryFn: fetchAllCustomers,
    staleTime: 1000 * 60 * 5,
  });

  const {
    mutate,
    isPending: isSubmittingMutation,
    isSuccess,
    error: mutationError,
  } = useMutation({
    mutationFn: createAppointment,
    onSuccess: (data) => {
      console.log("Mutation Success:", data);
      queryClient.invalidateQueries({
        queryKey: ["fetch-all-appointments"],
        exact: false,
      });
      toast.loading("Successfully created appointment", { duration: 1900 });
      redirect();
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      if (error?.status === 401) {
        localStorage.clear();
        toast.loading("Token expired, logging you out!", { duration: 1900 });
        logout();
      } else {
        toast.error(error?.message || "Failed to create appointment");
      }
    },
  });

  const initialValues = {
    name: "",
    noOfItemTypes: 0,
    items: [],
    notes: "",
    deliveryDate: "",
  };
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
            Add Appointment
          </Typography>
        </Grid2>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => {
            console.log("Form Values:", values);
            const submissionData = {
              customerId: values.name,
              itemDetails: values.items,
              notes: values.notes,
              deliveryDate: values.deliveryDate || null,
            };
            mutate(submissionData);
          }}
        >
          {({
            errors,
            touched,
            values,
            isSubmitting,
            handleChange,
            handleBlur,
            setFieldValue,
          }) => (
            <Form>
              <ItemArraySync />
              <Grid2
                container
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "1.5rem",
                  paddingLeft: "5rem",
                  paddingRight: "5rem",
                  paddingBottom: "1.5rem",
                }}
              >
                <FormControl error={touched.name && Boolean(errors.name)}>
                  <InputLabel id="nameLabel">Select Customer</InputLabel>
                  <Field
                    as={Select}
                    labelId="nameLabel"
                    id="name"
                    name="name"
                    label="Select Customer"
                    disabled={isLoadingCustomers}
                  >
                    {isLoadingCustomers ? (
                      <MenuItem value="" disabled>
                        <CircularProgress size={20} />
                      </MenuItem>
                    ) : isErrorCustomers ? (
                      <MenuItem value="" disabled>
                        Error loading customers
                      </MenuItem>
                    ) : customers && customers.length > 0 ? (
                      customers.map((customer) => (
                        <MenuItem value={customer.id} key={customer.id}>
                          {customer.customerId}{" "}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>
                        No customers found
                      </MenuItem>
                    )}
                  </Field>
                  <ErrorMessage name="name" component={FormHelperText} />
                </FormControl>

                <Field
                  as={TextField}
                  name="noOfItemTypes"
                  type="number"
                  id="noOfItemTypes"
                  label="Number of Item Types"
                  helperText={
                    touched.noOfItemTypes && errors.noOfItemTypes
                      ? errors.noOfItemTypes
                      : "e.g., 1 Shirt is 1 type, 2 Shirts is still 1 type"
                  }
                  error={touched.noOfItemTypes && Boolean(errors.noOfItemTypes)}
                  InputProps={{ inputProps: { min: 0, max: 10 } }}
                  size="medium"
                />

                {/* Dynamic Item Fields */}
                <FieldArray name="items">
                  {({ remove, push }) => (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      {values.items.length > 0 &&
                        values.items.map((item, index) => (
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
                  id="notes"
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
                  id="deliveryDate"
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
                    backgroundColor: "green",
                    "&:hover": { backgroundColor: "darkgreen" },
                  }}
                  disabled={isSubmittingMutation || isSubmitting}
                >
                  {isSubmittingMutation || isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Add"
                  )}
                </Button>

                {mutationError && !mutationError?.response?.status && (
                  <Alert severity="error">
                    {mutationError.message || "An unexpected error occurred."}
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
