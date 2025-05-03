import { QueryClient } from "@tanstack/react-query";

const Conn = import.meta.env.VITE_CONN_URI;
export const queryClient = new QueryClient();

export async function addNewCustomer({ signal, formData }) {
  const response = await fetch(`${Conn}/customers/add-customer`, {
    method: "post",
    body: JSON.stringify(formData),
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    signal: signal,
  });
  if (response.ok) {
    const result = await response.json();
    return result.result;
  } else {
    const error = new Error("Something went wrong");
    error.message = response.statusText;
    error.info = response;
    throw error;
  }
}

export async function editCustomer({ signal, formData }) {
  try {
    const response = await fetch(`${Conn}/customers/edit-customer`, {
      method: "put",
      body: JSON.stringify(formData),
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      signal: signal,
    });
    if (response.ok) {
      const result = await response.json();
      return result.result;
    } else {
      const error = new Error("Something went wrong");
      error.message = response.statusText;
      error.info = response;
      throw error;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function fetchCustomers({
  signal,
  page,
  rowsPerPage,
  searchTerm,
}) {
  try {
    const response = await fetch(
      `${Conn}/customers/get-all/?page=${
        page + 1
      }&limit=${rowsPerPage}&keyword=${searchTerm}`,
      { signal: signal }
    );
    const result = await response.json();
    console.log("sadadasdadasd");
    if (response.ok) {
      console.log("customers fetched");
      return { customers: result.result, totalRecords: result.totalRecords };
    }
  } catch (error) {
    console.error("Fetch error..............:", error);
  }
}

export default async function fetchAppointments({
  signal,
  page,
  rowsPerPage,
  searchTerm,
}) {
  try {
    const response = await fetch(
      `${Conn}/appointments/get-all/?page=${
        page + 1
      }&limit=${rowsPerPage}&keyword=${searchTerm}`,
      {
        headers: {
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        signal: signal,
      }
    );
    if (response.ok) {
      const result = await response.json();
      return {
        appointments: result.result,
        totalRecords: result.totalRecords,
      };
    } else {
      const error = new Error("Something went wrong");
      error.info = response;
      throw error;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function fetchAllCustomers({ signal }) {
  try {
    const response = await fetch(`${Conn}/customers/get-customers`, {
      signal: signal,
    });
    if (response.ok) {
      const result = await response.json();
      return result.result;
    } else {
      const error = new Error("Something went wrong!!");
      throw error;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function fetchAppointmentItems({ signal, appointmentId }) {
  const response = await fetch(
    `${Conn}/appointment-items/get-all/?appointmentId=${appointmentId}`,
    {
      signal: signal,
      headers: {
        authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  if (response.ok) {
    const result = await response.json();
    return result.result;
  } else {
    const error = new Error("Something went wrong");
    error.info = response;
    throw error;
  }
}

/**
 * Creates a new appointment via API call.
 * Designed to be used as the mutationFn in react-query's useMutation.
 *
 * @param {object} submissionData - The data submitted from the Formik form.
 * @param {string} submissionData.customerId - The selected customer ID.
 * @param {Array<object>} submissionData.itemDetails - Array of items like { itemName, itemQty, itemPrice }.
 * @param {string} [submissionData.notes] - Optional notes.
 * @param {string|null} [submissionData.deliveryDate] - Optional delivery date string (YYYY-MM-DD) or null.
 * @returns {Promise<object>} - Resolves with the response data from the API on success.
 * @throws {Error} - Throws an error on API call failure, including status and potentially parsed error info.
 */
export async function createAppointment(submissionData) {
  if (
    !submissionData ||
    !submissionData.customerId ||
    !Array.isArray(submissionData.itemDetails)
  ) {
    throw new Error("Invalid submission data provided to createAppointment.");
  }

  let suitsQty = 0;
  let totalPrice = 0;

  const processedItems = submissionData.itemDetails.map((item) => {
    const qty = parseFloat(item.itemQty) || 0;
    const price = parseFloat(item.itemPrice) || 0;
    const itemTotalPrice = qty * price;

    suitsQty += qty;
    totalPrice += itemTotalPrice;

    return {
      item: {
        name: item.itemName,
        price: price,
        qty: qty,
        itemTotalPrice: itemTotalPrice,
      },
    };
  });

  const appointmentData = {
    suitsQty,
    customerId: submissionData.customerId,
    notes: submissionData.notes || "",
    deliveryDate: submissionData.deliveryDate || null,
    totalPrice,
  };

  const myAppointmentPayload = { appointmentData, items: processedItems };

  console.log(
    "Payload being sent to API:",
    JSON.stringify(myAppointmentPayload, null, 2)
  );

  const token = localStorage.getItem("token");
  if (!token) {
    const error = new Error(
      "Authentication token not found. Please log in again."
    );
    error.status = 401;
    throw error;
  }

  const response = await fetch(`${Conn}/appointments/create-appointment`, {
    method: "POST",
    body: JSON.stringify(myAppointmentPayload),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let errorInfo = {
      message: `Request failed with status ${response.status}`,
    };
    try {
      errorInfo = await response.json();
    } catch (e) {
      console.error("Failed to parse error response:", e);
    }

    const error = new Error(
      errorInfo.message || `HTTP error! Status: ${response.status}`
    );
    error.status = response.status;
    error.info = errorInfo;
    console.error("API Error Info:", errorInfo);
    throw error;
  }

  const responseData = await response.json();
  console.log("API Success Response:", responseData);
  return responseData;
}

/**
 * Updates an existing appointment via API call.
 * Designed for use with useMutation.
 *
 * @param {object} params - The parameters for the update.
 * @param {string} params.appointmentId - The ID of the appointment to update.
 * @param {object} params.values - The updated form values from Formik.
 * @param {string} params.values.name - Customer ID.
 * @param {Array<object>} params.values.items - Array like { itemName, itemQty, itemPrice }.
 * @param {string} [params.values.notes] - Optional notes.
 * @param {string|null} [params.values.deliveryDate] - Optional delivery date.
 * @returns {Promise<object>} - Resolves with API response data on success.
 * @throws {Error} - Throws error on failure.
 */
export async function updateAppointment({ appointmentId, values }) {
  if (!appointmentId) {
    throw new Error("Appointment ID is required for update.");
  }
  if (!values || !values.name || !Array.isArray(values.items)) {
    throw new Error("Invalid submission data provided to updateAppointment.");
  }

  let suitsQty = 0;
  let totalPrice = 0;
  const processedItems = values.items.map((item) => {
    const qty = parseFloat(item.itemQty) || 0;
    const price = parseFloat(item.itemPrice) || 0;
    const itemTotalPrice = qty * price;
    suitsQty += qty;
    totalPrice += itemTotalPrice;
    return {
      item: {
        name: item.itemName,
        price: price,
        qty: qty,
        itemTotalPrice: itemTotalPrice,
      },
    };
  });

  const appointmentData = {
    suitsQty,
    customerId: values.name,
    notes: values.notes || "",
    deliveryDate: values.deliveryDate || null,
    totalPrice,
  };
  const myAppointmentPayload = { appointmentData, items: processedItems };

  // console.log("Payload for updating appointment ${appointmentId}:", JSON.stringify(myAppointmentPayload, null, 2));

  const token = localStorage.getItem("token");
  if (!token) {
    const error = new Error(
      "Authentication token not found. Please log in again."
    );
    error.status = 401;
    throw error;
  }
  const response = await fetch(
    `${Conn}/appointments/update-appointment/?appointmentId=${appointmentId}`,
    {
      method: "PUT",
      body: JSON.stringify(myAppointmentPayload),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    let errorInfo = { message: `Update failed with status ${response.status}` };
    try {
      errorInfo = await response.json();
    } catch (e) {
      console.error("Failed to parse error response:", e);
    }
    const error = new Error(
      errorInfo.message || `HTTP error! Status: ${response.status}`
    );
    error.status = response.status;
    error.info = errorInfo;
    console.error("API Update Error Info:", errorInfo);
    throw error;
  }

  const responseData = await response.json();
  console.log("API Update Success Response:", responseData);
  return responseData;
}
