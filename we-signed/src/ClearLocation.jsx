import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function useClearLocationState() {
  const location = useLocation();
  const navigate = useNavigate();
  const savedState = useRef(location.state); // capture the state once

  useEffect(() => {
    if (location.state) {
      // clear it after capturing
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  return savedState.current; // give caller the state
}
