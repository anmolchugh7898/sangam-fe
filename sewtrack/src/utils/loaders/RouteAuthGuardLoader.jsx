import { redirect } from "react-router-dom";
import useAuth from "../useAuth";

export default async function RouteAuthGuardLoader() {
  try {
    const verifiedAuth = await useAuth();
    if (!verifiedAuth.response) {
      localStorage.clear();
      return redirect("/");
    }
  } catch (error) {
    localStorage.clear();
    return redirect("/");
  }
}
