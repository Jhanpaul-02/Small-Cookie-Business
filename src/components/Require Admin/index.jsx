import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function RequireAdmin({ children }) {
  const [session, setSession] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function verifyAdmin() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (!session) {
          if (isMounted) setSession(null);
          return;
        }

        const response = await fetch("/api/admin/check", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (response.status === 401) {
          if (isMounted) setSession(null);
          return;
        }

        if (response.status === 403) {
          if (isMounted) {
            setErrorMessage("This account is not approved for admin access.");
          }
          return;
        }

        if (!response.ok) {
          throw new Error(`Admin check failed with status ${response.status}`);
        }

        if (isMounted) setSession(session);
      } catch (error) {
        console.error("Could not verify admin access:", error);
        if (isMounted) {
          setErrorMessage("Could not verify admin access. Please try again.");
        }
      } finally {
        if (isMounted) setIsChecking(false);
      }
    }

    verifyAdmin();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isChecking) return <p role="status">Checking sign-in...</p>;
  if (errorMessage) return <p role="alert">{errorMessage}</p>;
  if (!session) return <Navigate to="/admin/login" replace />;

  return children;
}
