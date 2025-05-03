const Conn = import.meta.env.VITE_CONN_URI;
export default async function useAuth() {
  const response = await fetch(`${Conn}/verify`, {
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (response.ok) {
    const result = await response.json();
    return {
      response: true,
      adminId: result.adminId,
      name: result.fullName,
    };
  } else {
    return {
      response: false,
      adminId: null,
      name: null,
    };
  }
}
