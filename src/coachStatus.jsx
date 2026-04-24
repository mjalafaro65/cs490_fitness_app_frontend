
import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import api
 from "./axios";
export const useCoachStatus = () => {
    const { user } = useAuth();
    const [coachStatus, setCoachStatus] = useState(null);
  
    useEffect(() => {
      const fetchCoach = async () => {
        if (!user?.roles?.includes(2)) return;
  
        try {
          const res = await api.get("/coach/coach-profile");
          setCoachStatus(res.data.status);
        } catch {
          setCoachStatus(null);
        }
      };
  
      fetchCoach();
    }, [user]);
  
    return coachStatus;
  };