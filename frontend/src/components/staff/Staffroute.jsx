import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  staffApi,
} from "./Staffapi";

const StaffContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useStaff = () => useContext(StaffContext);

/**
 * Wraps the staff and admin pages: sends signed-out visitors to the login
 * page. With `requireSuperuser`, only the administrator gets in; staff are
 * sent back to their own panel.
 */
const StaffRoute = ({ requireSuperuser = false }) => {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!getAccessToken() && !getRefreshToken()) {
      setStatus("denied");
      return;
    }

    staffApi
      .get("/me/")
      .then(({ data }) => {
        if (requireSuperuser && !data.is_superuser) {
          setStatus(data.can.view ? "not-admin" : "denied");
          if (!data.can.view) clearTokens();
        } else if (data.can.view || data.is_superuser) {
          setMe(data);
          setStatus("ok");
        } else {
          clearTokens();
          setStatus("denied");
        }
      })
      .catch(() => {
        clearTokens();
        setStatus("denied");
      });
  }, [requireSuperuser]);

  if (status === "loading") {
    return <p className="px-4 py-12 text-center text-gray-500">Loading...</p>;
  }

  if (status === "not-admin") {
    return <Navigate replace to="/staff/cars" />;
  }

  if (status === "denied") {
    return <Navigate replace to="/staff/login" />;
  }

  const logout = () => {
    clearTokens();
    navigate("/staff/login", { replace: true });
  };

  return (
    <StaffContext.Provider value={{ me, logout }}>
      <Outlet />
    </StaffContext.Provider>
  );
};

export default StaffRoute;