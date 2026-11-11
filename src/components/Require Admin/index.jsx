import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function RequireAdmin({ children }) {
  const [session, setSession] = useState(null);
  const [isChecking, setIsChecking] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (isMounted) {
        setSession(currentSession);
        setIsChecking(false);
      }
    });

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) return;

        if (error) {
          console.error("Could not check admin session:", error);
          setErrorMessage("Could not verify your sign-in. Please try again.");
        } else {
          setSession(data.session);
        }

        setIsChecking(false);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Could not check admin session:", error);
        setErrorMessage("Could not verify your sign-in. Please try again.");
        setIsChecking(false);
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isChecking) return <p role="status">Checking sign-in...</p>;
  if (errorMessage) return <p role="alert">{errorMessage}</p>;
  if (!session) return <Navigate to="/admin/login" replace />;

  return children;
}