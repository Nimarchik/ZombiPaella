import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { getSession } from "../services/authService";

const ProtectedRoute = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await getSession();

      setSession(session);
      setLoading(false);
    };

    checkSession();
  }, []);

  if (loading) {
    return <div>Завантаення...</div>;
  }

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;